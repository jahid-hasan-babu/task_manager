import apiClient from './client';
import { setStoredToken, removeStoredToken } from './client';
import type { AuthResponse, LoginCredentials, User } from '@/lib/types';

export async function login(
  credentials: LoginCredentials,
): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>(
    '/auth/login',
    credentials,
  );

  setStoredToken(data.accessToken);
  return data;
}

export async function register(input: {
  email: string;
  password: string;
  name: string;
}): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>(
    '/auth/register',
    input,
  );

  setStoredToken(data.accessToken);
  return data;
}

export async function getProfile(): Promise<User> {
  const { data } = await apiClient.get<User>('/auth/profile');
  return data;
}

export function logout(): void {
  removeStoredToken();
}
