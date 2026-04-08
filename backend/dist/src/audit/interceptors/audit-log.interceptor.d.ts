import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { AuditService } from '../audit.service';
export declare class AuditLogInterceptor implements NestInterceptor {
    private readonly reflector;
    private readonly auditService;
    private readonly logger;
    constructor(reflector: Reflector, auditService: AuditService);
    intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>>;
    private buildMetadata;
    private computeChanges;
    private sanitizeEntity;
    private sanitizeBody;
    private isModifyAction;
    private extractIp;
}
