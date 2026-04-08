import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuditService } from './audit.service';
import { AuditQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';
import { RolesGuard } from '../auth/guards';
import { Roles } from '../auth/decorators';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * GET /audit-logs
   * Admin-only. Returns paginated, filterable audit logs.
   *
   * Query Parameters:
   *   ?actorId=uuid           - Filter by who performed the action
   *   ?actionType=TASK_CREATED - Filter by action type
   *   ?targetEntity=TASK       - Filter by entity type
   *   ?targetId=uuid           - Filter by specific entity ID
   *   ?startDate=2025-01-01    - Filter from date
   *   ?endDate=2025-12-31      - Filter to date
   *   ?page=1&limit=20         - Pagination
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: AuditQueryDto) {
    return this.auditService.findAll({
      page: query.page,
      limit: query.limit,
      actorId: query.actorId,
      actionType: query.actionType,
      targetEntity: query.targetEntity,
      targetId: query.targetId,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    });
  }
}
