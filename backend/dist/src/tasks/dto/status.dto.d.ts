import { TaskStatus } from '@prisma/client';
export declare class UpdateStatusDto {
    status: TaskStatus;
}
export declare class AssignTaskDto {
    assignedUserId: string | null;
}
