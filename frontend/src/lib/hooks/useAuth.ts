'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';
import type { Role } from '@/lib/types';

/**
 * Hook that provides auth state and actions.
 * Optionally enforces authentication and role requirements.
 *
 * Usage:
 *   const { user, isAdmin } = useAuth();
 *   const { user } = useAuth({ required: true });
 *   const { user } = useAuth({ required: true, role: 'ADMIN' });
 */
export function useAuth(options?: { required?: boolean; role?: Role }) {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isLoading,
    isHydrated,
    error,
    login,
    register,
    logout,
    fetchProfile,
    clearError,
    isAdmin,
    hasRole,
  } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;

    // If auth is required but user is not authenticated
    if (options?.required && !isAuthenticated) {
      const currentPath = window.location.pathname;
      router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    // If a specific role is required but user doesn't have it
    if (options?.role && isAuthenticated && user && user.role !== options.role) {
      router.replace('/dashboard');
    }
  }, [isHydrated, isAuthenticated, user, options?.required, options?.role, router]);

  return {
    user,
    isAuthenticated,
    isLoading,
    isHydrated,
    error,
    login,
    register,
    logout,
    fetchProfile,
    clearError,
    isAdmin: isAdmin(),
    hasRole,
  };
}
