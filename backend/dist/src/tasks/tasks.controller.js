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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const tasks_service_1 = require("./tasks.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const audit_log_interceptor_1 = require("../audit/interceptors/audit-log.interceptor");
const audit_action_decorator_1 = require("../audit/decorators/audit-action.decorator");
let TasksController = class TasksController {
    tasksService;
    constructor(tasksService) {
        this.tasksService = tasksService;
    }
    create(dto, userId) {
        return this.tasksService.create(dto, userId);
    }
    findAll(page, limit, status, assignedUserId, search, user) {
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
    findOne(id) {
        return this.tasksService.findOne(id);
    }
    update(id, dto) {
        return this.tasksService.update(id, dto);
    }
    updateStatus(id, dto, user) {
        return this.tasksService.updateStatus(id, dto.status, user.id, user.role);
    }
    assignTask(id, dto) {
        return this.tasksService.assignTask(id, dto.assignedUserId);
    }
    remove(id) {
        return this.tasksService.remove(id);
    }
};
exports.TasksController = TasksController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, audit_action_decorator_1.AuditAction)({ entity: 'task', action: client_1.ActionType.TASK_CREATED }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateTaskDto, String]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('assignedUserId')),
    __param(4, (0, common_1.Query)('search')),
    __param(5, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Object]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, audit_action_decorator_1.AuditAction)({ entity: 'task', action: client_1.ActionType.TASK_UPDATED }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateTaskDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, audit_action_decorator_1.AuditAction)({ entity: 'task', action: client_1.ActionType.TASK_STATUS_CHANGED }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateStatusDto, Object]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/assign'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, audit_action_decorator_1.AuditAction)({ entity: 'task', action: client_1.ActionType.TASK_ASSIGNED }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.AssignTaskDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "assignTask", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, audit_action_decorator_1.AuditAction)({ entity: 'task', action: client_1.ActionType.TASK_DELETED }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "remove", null);
exports.TasksController = TasksController = __decorate([
    (0, common_1.Controller)('tasks'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.UseInterceptors)(audit_log_interceptor_1.AuditLogInterceptor),
    __metadata("design:paramtypes", [tasks_service_1.TasksService])
], TasksController);
//# sourceMappingURL=tasks.controller.js.map