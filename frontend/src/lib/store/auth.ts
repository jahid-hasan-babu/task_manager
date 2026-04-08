import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, Role } from '@/lib/types';
import {
  login as apiLogin,
  register as apiRegister,
  getProfile as apiGetProfile,
  logout as apiLogout,
} from '@/lib/api/auth';

// ── State shape ─────────────────────────────────────────────

interface AuthState {
  user: Pick<User, 'id' | 'email' | 'name' | 'role'> | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
  setHydrated: () => void;
  isAdmin: () => boolean;
  hasRole: (role: Role) => boolean;
}

type AuthStore = AuthState & AuthActions;

// ── Store ───────────────────────────────────────────────────

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiLogin({ email, password });

          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (err) {
          const message =
            err instanceof Error ? err.message : 'Login failed';

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: message,
          });

          throw err; // Re-throw so the component can handle it
        }
      },

      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiRegister({ email, password, name });

          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (err) {
          const message =
            err instanceof Error ? err.message : 'Registration failed';

          set({
            isLoading: false,
            error: message,
          });

          throw err;
        }
      },

      logout: () => {
        apiLogout();

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      fetchProfile: async () => {
        set({ isLoading: true });

        try {
          const profile = await apiGetProfile();

          set({
            user: {
              id: profile.id,
              email: profile.email,
              name: profile.name,
              role: profile.role,
            },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          // Token invalid or expired — clear state
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      clearError: () => set({ error: null }),

      setHydrated: () => set({ isHydrated: true }),

      isAdmin: () => get().user?.role === 'ADMIN',

      hasRole: (role: Role) => get().user?.role === role,
    }),
    {
      name: 'task-manager-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
