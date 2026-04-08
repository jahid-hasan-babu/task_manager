import apiClient from './client';
import type { AuditLog, PaginatedResponse, ActionType } from '../types';

export interface AuditQueryParams {
  page?: number;
  limit?: number;
  actionType?: ActionType;
  actorId?: string;
  startDate?: string;
  endDate?: string;
}

export async function getAuditLogs(
  params?: AuditQueryParams,
): Promise<PaginatedResponse<AuditLog>> {
  const { data } = await apiClient.get<PaginatedResponse<AuditLog>>(
    '/audit-logs',
    { params },
  );
  return data;
}

export async function getAuditLogById(id: string): Promise<AuditLog> {
  const { data } = await apiClient.get<AuditLog>(`/audit-logs/${id}`);
  return data;
}
