import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ActionType } from '@prisma/client';

export class AuditQueryDto {
  @IsOptional()
  @IsUUID('4', { message: 'actorId must be a valid UUID' })
  actorId?: string;

  @IsOptional()
  @IsEnum(ActionType, { message: 'Invalid action type' })
  actionType?: ActionType;

  @IsOptional()
  @IsString()
  targetEntity?: string;

  @IsOptional()
  @IsString()
  targetId?: string;

  @IsOptional()
  @IsDateString({}, { message: 'startDate must be a valid ISO 8601 date string' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'endDate must be a valid ISO 8601 date string' })
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
