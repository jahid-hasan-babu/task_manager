import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Role, ActionType, TaskStatus } from '@prisma/client';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, UpdateStatusDto, AssignTaskDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuditLogInterceptor } from '../audit/interceptors/audit-log.interceptor';
import { AuditAction } from '../audit/decorators/audit-action.decorator';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(AuditLogInterceptor)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Roles(Role.ADMIN)
  @AuditAction({ entity: 'task', action: ActionType.TASK_CREATED })
  create(@Body() dto: CreateTaskDto, @CurrentUser('id') userId: string) {
    return this.tasksService.create(dto, userId);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: TaskStatus,
    @Query('assignedUserId') assignedUserId?: string,
    @Query('search') search?: string,
    @CurrentUser() user?: any,
  ) {
    return this.tasksService.findAll({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      status,
      assignedUserId,
      search,
      userId: user?.id,
      userRole: user?.role,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @AuditAction({ entity: 'task', action: ActionType.TASK_UPDATED })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, dto);
  }

  @Patch(':id/status')
  @AuditAction({ entity: 'task', action: ActionType.TASK_STATUS_CHANGED })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.tasksService.updateStatus(id, dto.status, user.id, user.role);
  }

  @Patch(':id/assign')
  @Roles(Role.ADMIN)
  @AuditAction({ entity: 'task', action: ActionType.TASK_ASSIGNED })
  assignTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignTaskDto,
  ) {
    return this.tasksService.assignTask(id, dto.assignedUserId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @AuditAction({ entity: 'task', action: ActionType.TASK_DELETED })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.remove(id);
  }
}
