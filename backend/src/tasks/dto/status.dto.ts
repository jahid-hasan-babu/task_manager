import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { TaskStatus } from '@prisma/client';

export class UpdateStatusDto {
  @IsEnum(TaskStatus, { message: 'Invalid task status' })
  status: TaskStatus;
}

export class AssignTaskDto {
  @IsUUID('4', { message: 'assignedUserId must be a valid UUID' })
  @IsOptional()
  assignedUserId: string | null;
}
