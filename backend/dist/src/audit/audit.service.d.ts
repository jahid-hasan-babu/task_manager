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
export declare class AuditService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createLog(input: CreateAuditLogInput): Promise<void>;
    findAll(params: {
        page?: number;
        limit?: number;
        actorId?: string;
        actionType?: ActionType;
        targetEntity?: string;
        targetId?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        data: ({
            actor: {
                id: string;
                email: string;
                name: string;
                role: import(".prisma/client").$Enums.Role;
            };
        } & {
            id: string;
            createdAt: Date;
            actionType: import(".prisma/client").$Enums.ActionType;
            targetEntity: string;
            targetId: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            ipAddress: string | null;
            actorId: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getEntitySnapshot(entity: string, id: string): Promise<Record<string, any> | null>;
}
