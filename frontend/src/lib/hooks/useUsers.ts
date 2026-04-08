'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import type { User } from '../types';
import { useAuthStore } from '../store/auth';

export function useUsers() {
  const isAdmin = useAuthStore((s) => s.isAdmin());

  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await apiClient.get<User[]>('/users');
      return data;
    },
    enabled: isAdmin, // Only fetch if admin
  });
}
