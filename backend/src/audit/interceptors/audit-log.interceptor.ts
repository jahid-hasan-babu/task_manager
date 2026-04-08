import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { AuditService } from '../audit.service';
import {
  AUDIT_ACTION_KEY,
  AuditActionMetadata,
} from '../decorators/audit-action.decorator';

/**
 * Interceptor that automatically captures audit logs for any handler
 * decorated with @AuditAction().
 *
 * Flow:
 * 1. Before handler: fetch "before" snapshot (for updates/deletes)
 * 2. Handler executes
 * 3. After handler: capture "after" state from response
 * 4. Fire-and-forget: save audit log asynchronously
 *
 * Apply globally or per-controller:
 *   @UseInterceptors(AuditLogInterceptor)
 */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    // Check if handler has @AuditAction() metadata
    const auditMeta = this.reflector.get<AuditActionMetadata>(
      AUDIT_ACTION_KEY,
      context.getHandler(),
    );

    // No @AuditAction() → pass through, zero overhead
    if (!auditMeta) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // If no user on request, skip audit (shouldn't happen on protected routes)
    if (!user) {
      this.logger.warn(
        `AuditLogInterceptor: No user on request for ${auditMeta.action}. Skipping.`,
      );
      return next.handle();
    }

    const { entity, action, idParam = 'id' } = auditMeta;
    const targetId = request.params?.[idParam];
    const ipAddress = this.extractIp(request);
    const userAgent = request.headers?.['user-agent'] || 'unknown';

    // ── BEFORE: Capture previous state for updates/deletes ──
    let beforeSnapshot: Record<string, any> | null = null;

    if (targetId && this.isModifyAction(action)) {
      beforeSnapshot = await this.auditService.getEntitySnapshot(
        entity,
        targetId,
      );
    }

    // ── EXECUTE HANDLER ──
    return next.handle().pipe(
      tap({
        next: (responseData) => {
          // ── AFTER: Fire-and-forget audit log creation ──
          const resolvedTargetId =
            targetId || responseData?.id || 'unknown';

          const metadata = this.buildMetadata({
            action,
            beforeSnapshot,
            afterSnapshot: responseData,
            requestBody: request.body,
            userAgent,
          });

          // Intentionally not awaited — audit must not block response
          this.auditService
            .createLog({
              actorId: user.id,
              actorName: user.name,
              actionType: action,
              targetEntity: entity,
              targetId: resolvedTargetId,
              metadata,
              ipAddress,
              userAgent,
            })
            .catch((err) =>
              this.logger.error(`Audit log failed: ${err.message}`),
            );
        },
        error: (err) => {
          // Log failed operations too (with error context)
          const resolvedTargetId = targetId || 'unknown';

          this.auditService
            .createLog({
              actorId: user.id,
              actorName: user.name,
              actionType: action,
              targetEntity: entity,
              targetId: resolvedTargetId,
              metadata: {
                success: false,
                error: err.message,
                statusCode: err.status || 500,
                requestBody: this.sanitizeBody(request.body),
              },
              ipAddress,
              userAgent,
            })
            .catch((logErr) =>
              this.logger.error(`Audit error log failed: ${logErr.message}`),
            );
        },
      }),
    );
  }

  /**
   * Build structured metadata with before/after diffs.
   */
  private buildMetadata(params: {
    action: string;
    beforeSnapshot: Record<string, any> | null;
    afterSnapshot: any;
    requestBody: any;
    userAgent: string;
  }): Record<string, any> {
    const { action, beforeSnapshot, afterSnapshot, requestBody } = params;
    const metadata: Record<string, any> = { success: true };

    // For create actions: capture what was created
    if (action.includes('CREATED')) {
      metadata.created = this.sanitizeEntity(afterSnapshot);
      metadata.requestBody = this.sanitizeBody(requestBody);
    }

    // For update actions: capture before/after diff
    if (action.includes('UPDATED') || action.includes('CHANGED') || action.includes('ASSIGNED')) {
      metadata.requestBody = this.sanitizeBody(requestBody);

      if (beforeSnapshot) {
        metadata.before = this.sanitizeEntity(beforeSnapshot);
        metadata.after = this.sanitizeEntity(afterSnapshot);
        metadata.changes = this.computeChanges(beforeSnapshot, afterSnapshot);
      }
    }

    // For delete actions: capture what was deleted
    if (action.includes('DELETED')) {
      metadata.deleted = this.sanitizeEntity(beforeSnapshot || afterSnapshot);
    }

    return metadata;
  }

  /**
   * Compute field-level changes between before and after states.
   * Returns only the fields that actually changed.
   */
  private computeChanges(
    before: Record<string, any>,
    after: Record<string, any>,
  ): Record<string, { from: any; to: any }> | null {
    if (!before || !after) return null;

    const changes: Record<string, { from: any; to: any }> = {};

    // Compare all keys from the "after" object (response)
    for (const key of Object.keys(after)) {
      if (key === 'updatedAt' || key === 'password') continue;

      const beforeVal = before[key];
      const afterVal = after[key];

      if (
        beforeVal !== undefined &&
        JSON.stringify(beforeVal) !== JSON.stringify(afterVal)
      ) {
        changes[key] = { from: beforeVal, to: afterVal };
      }
    }

    return Object.keys(changes).length > 0 ? changes : null;
  }

  /**
   * Strip sensitive fields from entity data before logging.
   */
  private sanitizeEntity(entity: any): any {
    if (!entity || typeof entity !== 'object') return entity;

    const { password, ...safe } = entity;
    return safe;
  }

  /**
   * Strip sensitive fields from request body before logging.
   */
  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') return body;

    const { password, confirmPassword, ...safe } = body;
    return safe;
  }

  /**
   * Determine if this action modifies existing data
   * (and thus we need a "before" snapshot).
   */
  private isModifyAction(action: string): boolean {
    return (
      action.includes('UPDATED') ||
      action.includes('DELETED') ||
      action.includes('CHANGED') ||
      action.includes('ASSIGNED')
    );
  }

  /**
   * Extract real client IP, respecting reverse proxy headers.
   */
  private extractIp(request: any): string {
    return (
      request.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
      request.headers?.['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.ip ||
      'unknown'
    );
  }
}
