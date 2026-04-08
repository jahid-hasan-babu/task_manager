import { TaskStatus } from '@prisma/client';
export declare class CreateTaskDto {
    title: string;
    description?: string;
    status?: TaskStatus;
    assignedUserId?: string;
    dueDate?: string;
}
