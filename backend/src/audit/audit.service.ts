import { Injectable, Logger } from '@nestjs/common';
import { ActionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateAuditLogInput {
  actorId: string;
  actorName?: string;
  actionType: ActionType;
  targetEntity: string;
  targetId: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates an audit log entry.
   * Called by the interceptor (fire-and-forget) or directly from services.
   */
  async createLog(input: CreateAuditLogInput): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorId: input.actorId,
          actionType: input.actionType,
          targetEntity: input.targetEntity,
          targetId: input.targetId,
          ipAddress: input.ipAddress || null,
          metadata: {
            ...(input.metadata || {}),
            actorName: input.actorName,
            userAgent: input.userAgent,
            timestamp: new Date().toISOString(),
          },
        },
      });

      this.logger.debug(
        `Audit: ${input.actorName || input.actorId} → ${input.actionType} on ${input.targetEntity}#${input.targetId}`,
      );
    } catch (error:any) {
      // Audit logging must NEVER crash the main request
      this.logger.error(
        `Failed to create audit log: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Fetch audit logs with filtering, pagination, and sorting.
   * Admin-only — called from AuditController.
   */
  async findAll(params: {
    page?: number;
    limit?: number;
    actorId?: string;
    actionType?: ActionType;
    targetEntity?: string;
    targetId?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const {
      page = 1,
      limit = 20,
      actorId,
      actionType,
      targetEntity,
      targetId,
      startDate,
      endDate,
    } = params;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (actorId) where.actorId = actorId;
    if (actionType) where.actionType = actionType;
    if (targetEntity) where.targetEntity = targetEntity;
    if (targetId) where.targetId = targetId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Fetch the "before" snapshot of an entity for diff tracking.
   * Used by the interceptor before the handler modifies data.
   */
  async getEntitySnapshot(
    entity: string,
    id: string,
  ): Promise<Record<string, any> | null> {
    try {
      const modelName = entity.toLowerCase();

      // Dynamically access the right Prisma model
      const model = (this.prisma as any)[modelName];

      if (!model) {
        this.logger.warn(`No Prisma model found for entity: ${entity}`);
        return null;
      }

      return await model.findUnique({ where: { id } });
    } catch (error:any) {
      this.logger.error(
        `Failed to fetch snapshot for ${entity}#${id}: ${error.message}`,
      );
      return null;
    }
  }
}
