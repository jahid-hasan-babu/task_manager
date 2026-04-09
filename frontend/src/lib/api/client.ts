import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';

// ── Token storage helpers ───────────────────────────────────

import Cookies from 'js-cookie';

const TOKEN_KEY = 'task_manager_token';

export function getStoredToken(): string | null {
  return Cookies.get(TOKEN_KEY) || null;
}

export function setStoredToken(token: string): void {
  Cookies.set(TOKEN_KEY, token, {
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
}

export function removeStoredToken(): void {
  Cookies.remove(TOKEN_KEY);
}

// ── Axios instance ──────────────────────────────────────────

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8_000,
  headers: {
    'Content-Type': 'application/json',
    'Connection': 'keep-alive',
  },
});

// ── Request interceptor: attach JWT ─────────────────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// ── Response interceptor: handle 401 + errors ───────────────

let isRedirecting = false;

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;

    // 401 Unauthorized → token expired or invalid
    if (status === 401 && !isRedirecting) {
      isRedirecting = true;
      removeStoredToken();

      // Clear Zustand store (lazy import to avoid circular deps)
      const { useAuthStore } = await import('@/lib/store/auth');
      useAuthStore.getState().logout();

      // Redirect to login
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;

        // Don't redirect if already on login page
        if (currentPath !== '/login') {
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
      }

      isRedirecting = false;
    }

    // Normalize error message for consumers
    const apiError = error.response?.data as
      | { message?: string | string[]; error?: string }
      | undefined;

    const message = Array.isArray(apiError?.message)
      ? apiError.message[0]
      : apiError?.message || error.message || 'An unexpected error occurred';

    return Promise.reject(new Error(message));
  },
);

export default apiClient;
