"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuditService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AuditService = AuditService_1 = class AuditService {
    prisma;
    logger = new common_1.Logger(AuditService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createLog(input) {
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
            this.logger.debug(`Audit: ${input.actorName || input.actorId} → ${input.actionType} on ${input.targetEntity}#${input.targetId}`);
        }
        catch (error) {
            this.logger.error(`Failed to create audit log: ${error.message}`, error.stack);
        }
    }
    async findAll(params) {
        const { page = 1, limit = 20, actorId, actionType, targetEntity, targetId, startDate, endDate, } = params;
        const skip = (page - 1) * limit;
        const where = {};
        if (actorId)
            where.actorId = actorId;
        if (actionType)
            where.actionType = actionType;
        if (targetEntity)
            where.targetEntity = targetEntity;
        if (targetId)
            where.targetId = targetId;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = startDate;
            if (endDate)
                where.createdAt.lte = endDate;
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
    async getEntitySnapshot(entity, id) {
        try {
            const modelName = entity.toLowerCase();
            const model = this.prisma[modelName];
            if (!model) {
                this.logger.warn(`No Prisma model found for entity: ${entity}`);
                return null;
            }
            return await model.findUnique({ where: { id } });
        }
        catch (error) {
            this.logger.error(`Failed to fetch snapshot for ${entity}#${id}: ${error.message}`);
            return null;
        }
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = AuditService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditService);
//# sourceMappingURL=audit.service.js.map