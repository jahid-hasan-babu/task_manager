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
var AuditLogInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogInterceptor = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const rxjs_1 = require("rxjs");
const audit_service_1 = require("../audit.service");
const audit_action_decorator_1 = require("../decorators/audit-action.decorator");
let AuditLogInterceptor = AuditLogInterceptor_1 = class AuditLogInterceptor {
    reflector;
    auditService;
    logger = new common_1.Logger(AuditLogInterceptor_1.name);
    constructor(reflector, auditService) {
        this.reflector = reflector;
        this.auditService = auditService;
    }
    async intercept(context, next) {
        const auditMeta = this.reflector.get(audit_action_decorator_1.AUDIT_ACTION_KEY, context.getHandler());
        if (!auditMeta) {
            return next.handle();
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            this.logger.warn(`AuditLogInterceptor: No user on request for ${auditMeta.action}. Skipping.`);
            return next.handle();
        }
        const { entity, action, idParam = 'id' } = auditMeta;
        const targetId = request.params?.[idParam];
        const ipAddress = this.extractIp(request);
        const userAgent = request.headers?.['user-agent'] || 'unknown';
        let beforeSnapshot = null;
        if (targetId && this.isModifyAction(action)) {
            beforeSnapshot = await this.auditService.getEntitySnapshot(entity, targetId);
        }
        return next.handle().pipe((0, rxjs_1.tap)({
            next: (responseData) => {
                const resolvedTargetId = targetId || responseData?.id || 'unknown';
                const metadata = this.buildMetadata({
                    action,
                    beforeSnapshot,
                    afterSnapshot: responseData,
                    requestBody: request.body,
                    userAgent,
                });
                this.auditService
                    .createLog({
                    actorId: user.id,
                    actorName: user.name,
                    actionType: action,
                    targetEntity: entity,
                    targetId: resolvedTargetId,
                    metadata,
                    ipAddress,
                    userAgent,
                })
                    .catch((err) => this.logger.error(`Audit log failed: ${err.message}`));
            },
            error: (err) => {
                const resolvedTargetId = targetId || 'unknown';
                this.auditService
                    .createLog({
                    actorId: user.id,
                    actorName: user.name,
                    actionType: action,
                    targetEntity: entity,
                    targetId: resolvedTargetId,
                    metadata: {
                        success: false,
                        error: err.message,
                        statusCode: err.status || 500,
                        requestBody: this.sanitizeBody(request.body),
                    },
                    ipAddress,
                    userAgent,
                })
                    .catch((logErr) => this.logger.error(`Audit error log failed: ${logErr.message}`));
            },
        }));
    }
    buildMetadata(params) {
        const { action, beforeSnapshot, afterSnapshot, requestBody } = params;
        const metadata = { success: true };
        if (action.includes('CREATED')) {
            metadata.created = this.sanitizeEntity(afterSnapshot);
            metadata.requestBody = this.sanitizeBody(requestBody);
        }
        if (action.includes('UPDATED') || action.includes('CHANGED') || action.includes('ASSIGNED')) {
            metadata.requestBody = this.sanitizeBody(requestBody);
            if (beforeSnapshot) {
                metadata.before = this.sanitizeEntity(beforeSnapshot);
                metadata.after = this.sanitizeEntity(afterSnapshot);
                metadata.changes = this.computeChanges(beforeSnapshot, afterSnapshot);
            }
        }
        if (action.includes('DELETED')) {
            metadata.deleted = this.sanitizeEntity(beforeSnapshot || afterSnapshot);
        }
        return metadata;
    }
    computeChanges(before, after) {
        if (!before || !after)
            return null;
        const changes = {};
        for (const key of Object.keys(after)) {
            if (key === 'updatedAt' || key === 'password')
                continue;
            const beforeVal = before[key];
            const afterVal = after[key];
            if (beforeVal !== undefined &&
                JSON.stringify(beforeVal) !== JSON.stringify(afterVal)) {
                changes[key] = { from: beforeVal, to: afterVal };
            }
        }
        return Object.keys(changes).length > 0 ? changes : null;
    }
    sanitizeEntity(entity) {
        if (!entity || typeof entity !== 'object')
            return entity;
        const { password, ...safe } = entity;
        return safe;
    }
    sanitizeBody(body) {
        if (!body || typeof body !== 'object')
            return body;
        const { password, confirmPassword, ...safe } = body;
        return safe;
    }
    isModifyAction(action) {
        return (action.includes('UPDATED') ||
            action.includes('DELETED') ||
            action.includes('CHANGED') ||
            action.includes('ASSIGNED'));
    }
    extractIp(request) {
        return (request.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
            request.headers?.['x-real-ip'] ||
            request.connection?.remoteAddress ||
            request.ip ||
            'unknown');
    }
};
exports.AuditLogInterceptor = AuditLogInterceptor;
exports.AuditLogInterceptor = AuditLogInterceptor = AuditLogInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        audit_service_1.AuditService])
], AuditLogInterceptor);
//# sourceMappingURL=audit-log.interceptor.js.map