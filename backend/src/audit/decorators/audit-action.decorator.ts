import { SetMetadata } from '@nestjs/common';
import { ActionType } from '@prisma/client';

export const AUDIT_ACTION_KEY = 'audit_action';

export interface AuditActionMetadata {
  /** The entity being acted upon: 'TASK', 'USER', etc. */
  entity: string;

  /** The action type matching the Prisma ActionType enum */
  action: ActionType;

  /**
   * Optional: ID param name in the route (defaults to 'id').
   * Used to fetch the "before" state for updates/deletes.
   * Example: @AuditAction({ entity: 'TASK', action: 'TASK_UPDATED', idParam: 'taskId' })
   */
  idParam?: string;
}

/**
 * Marks an endpoint for automatic audit logging.
 * Used in combination with AuditLogInterceptor.
 *
 * Usage:
 *   @AuditAction({ entity: 'TASK', action: ActionType.TASK_CREATED })
 *   @Post()
 *   createTask() { }
 *
 *   @AuditAction({ entity: 'TASK', action: ActionType.TASK_UPDATED })
 *   @Patch(':id')
 *   updateTask() { }
 */
export const AuditAction = (metadata: AuditActionMetadata) =>
  SetMetadata(AUDIT_ACTION_KEY, metadata);
