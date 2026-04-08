'use client';

import { useQuery } from '@tanstack/react-query';
import { getAuditLogs, type AuditQueryParams } from '@/lib/api/audit';
import { useAuthStore } from '@/lib/store/auth';

export const auditKeys = {
  all: ['audit'] as const,
  lists: () => [...auditKeys.all, 'list'] as const,
  list: (params?: AuditQueryParams) => [...auditKeys.lists(), params] as const,
};

export function useAuditLogs(params?: AuditQueryParams) {
  const isAdmin = useAuthStore((s) => s.isAdmin());

  return useQuery({
    queryKey: auditKeys.list(params),
    queryFn: () => getAuditLogs(params),
    enabled: isAdmin, // Only fetch if the user is an admin
  });
}
