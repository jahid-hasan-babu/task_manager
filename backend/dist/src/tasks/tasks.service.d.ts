import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { Role, TaskStatus } from '@prisma/client';
export declare class TasksService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateTaskDto, createdById: string): Promise<{
        assignedUser: {
            id: string;
            email: string;
            name: string;
        } | null;
        createdBy: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        status: import(".prisma/client").$Enums.TaskStatus;
        assignedUserId: string | null;
        dueDate: Date | null;
        createdById: string;
    }>;
    findAll(params: {
        page?: number;
        limit?: number;
        status?: TaskStatus;
        assignedUserId?: string;
        search?: string;
        userId?: string;
        userRole?: Role;
    }): Promise<{
        data: ({
            assignedUser: {
                id: string;
                email: string;
                name: string;
            } | null;
            createdBy: {
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string | null;
            status: import(".prisma/client").$Enums.TaskStatus;
            assignedUserId: string | null;
            dueDate: Date | null;
            createdById: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        assignedUser: {
            id: string;
            email: string;
            name: string;
        } | null;
        createdBy: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        status: import(".prisma/client").$Enums.TaskStatus;
        assignedUserId: string | null;
        dueDate: Date | null;
        createdById: string;
    }>;
    update(id: string, dto: UpdateTaskDto): Promise<{
        assignedUser: {
            id: string;
            email: string;
            name: string;
        } | null;
        createdBy: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        status: import(".prisma/client").$Enums.TaskStatus;
        assignedUserId: string | null;
        dueDate: Date | null;
        createdById: string;
    }>;
    updateStatus(id: string, status: TaskStatus, userId: string, userRole: Role): Promise<{
        assignedUser: {
            id: string;
            email: string;
            name: string;
        } | null;
        createdBy: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        status: import(".prisma/client").$Enums.TaskStatus;
        assignedUserId: string | null;
        dueDate: Date | null;
        createdById: string;
    }>;
    assignTask(id: string, assignedUserId: string | null): Promise<{
        assignedUser: {
            id: string;
            email: string;
            name: string;
        } | null;
        createdBy: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        status: import(".prisma/client").$Enums.TaskStatus;
        assignedUserId: string | null;
        dueDate: Date | null;
        createdById: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        status: import(".prisma/client").$Enums.TaskStatus;
        assignedUserId: string | null;
        dueDate: Date | null;
        createdById: string;
    }>;
}
