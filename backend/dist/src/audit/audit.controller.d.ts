import { AuditService } from './audit.service';
import { AuditQueryDto } from './dto';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    findAll(query: AuditQueryDto): Promise<{
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
}
