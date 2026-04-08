import { ActionType } from '@prisma/client';
export declare class AuditQueryDto {
    actorId?: string;
    actionType?: ActionType;
    targetEntity?: string;
    targetId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}
