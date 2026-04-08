import apiClient from './client';
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  PaginatedResponse,
} from '@/lib/types';

// ── Query params ────────────────────────────────────────────

export interface TaskQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  assignedUserId?: string;
  search?: string;
}

// ── API functions ───────────────────────────────────────────

export async function getTasks(
  params?: TaskQueryParams,
): Promise<PaginatedResponse<Task>> {
  const { data } = await apiClient.get<PaginatedResponse<Task>>('/tasks', {
    params,
  });
  return data;
}

export async function getTaskById(id: string): Promise<Task> {
  const { data } = await apiClient.get<Task>(`/tasks/${id}`);
  return data;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const { data } = await apiClient.post<Task>('/tasks', input);
  return data;
}

export async function updateTask(
  id: string,
  input: UpdateTaskInput,
): Promise<Task> {
  const { data } = await apiClient.patch<Task>(`/tasks/${id}`, input);
  return data;
}

export async function updateTaskStatus(
  id: string,
  status: string,
): Promise<Task> {
  const { data } = await apiClient.patch<Task>(`/tasks/${id}/status`, {
    status,
  });
  return data;
}

export async function assignTask(
  id: string,
  assignedUserId: string | null,
): Promise<Task> {
  const { data } = await apiClient.patch<Task>(`/tasks/${id}/assign`, {
    assignedUserId,
  });
  return data;
}

export async function deleteTask(id: string): Promise<void> {
  await apiClient.delete(`/tasks/${id}`);
}
