import { ActionType } from '@prisma/client';
export declare const AUDIT_ACTION_KEY = "audit_action";
export interface AuditActionMetadata {
    entity: string;
    action: ActionType;
    idParam?: string;
}
export declare const AuditAction: (metadata: AuditActionMetadata) => import("@nestjs/common").CustomDecorator<string>;
