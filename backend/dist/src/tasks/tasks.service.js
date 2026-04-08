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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let TasksService = class TasksService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, createdById) {
        return this.prisma.task.create({
            data: {
                title: dto.title,
                description: dto.description,
                status: dto.status || client_1.TaskStatus.TODO,
                assignedUserId: dto.assignedUserId || null,
                createdById,
                dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
            },
            include: {
                assignedUser: { select: { id: true, name: true, email: true } },
                createdBy: { select: { id: true, name: true, email: true } },
            },
        });
    }
    async findAll(params) {
        const { page = 1, limit = 20, status, assignedUserId, search, userId, userRole, } = params;
        const skip = (page - 1) * limit;
        const where = {};
        if (userRole === client_1.Role.USER && userId) {
            where.assignedUserId = userId;
        }
        if (status)
            where.status = status;
        if (assignedUserId)
            where.assignedUserId = assignedUserId;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma.task.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    assignedUser: { select: { id: true, name: true, email: true } },
                    createdBy: { select: { id: true, name: true, email: true } },
                },
            }),
            this.prisma.task.count({ where }),
        ]);
        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const task = await this.prisma.task.findUnique({
            where: { id },
            include: {
                assignedUser: { select: { id: true, name: true, email: true } },
                createdBy: { select: { id: true, name: true, email: true } },
            },
        });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        return task;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.task.update({
            where: { id },
            data: {
                ...(dto.title !== undefined && { title: dto.title }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.status !== undefined && { status: dto.status }),
                ...(dto.assignedUserId !== undefined && {
                    assignedUserId: dto.assignedUserId || null,
                }),
                ...(dto.dueDate !== undefined && {
                    dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
                }),
            },
            include: {
                assignedUser: { select: { id: true, name: true, email: true } },
                createdBy: { select: { id: true, name: true, email: true } },
            },
        });
    }
    async updateStatus(id, status, userId, userRole) {
        const task = await this.findOne(id);
        if (userRole === client_1.Role.USER && task.assignedUserId !== userId) {
            throw new common_1.ForbiddenException('You can only update status of tasks assigned to you');
        }
        return this.prisma.task.update({
            where: { id },
            data: { status },
            include: {
                assignedUser: { select: { id: true, name: true, email: true } },
                createdBy: { select: { id: true, name: true, email: true } },
            },
        });
    }
    async assignTask(id, assignedUserId) {
        await this.findOne(id);
        if (assignedUserId) {
            const user = await this.prisma.user.findUnique({
                where: { id: assignedUserId },
            });
            if (!user)
                throw new common_1.NotFoundException('Assigned user not found');
        }
        return this.prisma.task.update({
            where: { id },
            data: { assignedUserId },
            include: {
                assignedUser: { select: { id: true, name: true, email: true } },
                createdBy: { select: { id: true, name: true, email: true } },
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.task.delete({ where: { id } });
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map