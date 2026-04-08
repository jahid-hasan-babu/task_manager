import { TaskStatus } from '@prisma/client';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, UpdateStatusDto, AssignTaskDto } from './dto';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    create(dto: CreateTaskDto, userId: string): Promise<{
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
    findAll(page?: string, limit?: string, status?: TaskStatus, assignedUserId?: string, search?: string, user?: any): Promise<{
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
    updateStatus(id: string, dto: UpdateStatusDto, user: any): Promise<{
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
    assignTask(id: string, dto: AssignTaskDto): Promise<{
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
