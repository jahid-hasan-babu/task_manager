'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  assignTask,
  deleteTask,
  type TaskQueryParams,
} from '@/lib/api/tasks';
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  PaginatedResponse,
} from '@/lib/types';

// ── Query keys ──────────────────────────────────────────────

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (params?: TaskQueryParams) =>
    [...taskKeys.lists(), params] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
};

// ── Queries ─────────────────────────────────────────────────

export function useTasks(params?: TaskQueryParams) {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: () => getTasks(params),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => getTaskById(id),
    enabled: !!id,
  });
}

// ── Mutations ───────────────────────────────────────────────

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(input),
    onSuccess: (newTask) => {
      // Invalidate all task lists to refetch
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      toast.success('Task created', {
        description: `"${newTask.title}" has been created successfully.`,
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to create task', {
        description: error.message,
      });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) =>
      updateTask(id, input),
    onMutate: async ({ id, input }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });

      // Snapshot previous value
      const previousLists = queryClient.getQueriesData<
        PaginatedResponse<Task>
      >({ queryKey: taskKeys.lists() });

      // Optimistic update across all cached lists
      queryClient.setQueriesData<PaginatedResponse<Task>>(
        { queryKey: taskKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((task) =>
              task.id === id ? { ...task, ...input } : task,
            ),
          };
        },
      );

      return { previousLists };
    },
    onError: (error: Error, _vars, context) => {
      // Rollback on error
      if (context?.previousLists) {
        context.previousLists.forEach(([key, data]) => {
          if (data) queryClient.setQueryData(key, data);
        });
      }
      toast.error('Failed to update task', {
        description: error.message,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
    onSuccess: (updatedTask) => {
      queryClient.setQueryData(taskKeys.detail(updatedTask.id), updatedTask);
      toast.success('Task updated', {
        description: `"${updatedTask.title}" has been updated.`,
      });
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateTaskStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });

      const previousLists = queryClient.getQueriesData<
        PaginatedResponse<Task>
      >({ queryKey: taskKeys.lists() });

      // Optimistic update
      queryClient.setQueriesData<PaginatedResponse<Task>>(
        { queryKey: taskKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((task) =>
              task.id === id ? { ...task, status: status as Task['status'] } : task,
            ),
          };
        },
      );

      return { previousLists };
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previousLists) {
        context.previousLists.forEach(([key, data]) => {
          if (data) queryClient.setQueryData(key, data);
        });
      }
      toast.error('Failed to update status', {
        description: error.message,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
    onSuccess: (updatedTask) => {
      queryClient.setQueryData(taskKeys.detail(updatedTask.id), updatedTask);
      toast.success('Status updated', {
        description: `Task moved to ${updatedTask.status.replace(/_/g, ' ').toLowerCase()}.`,
      });
    },
  });
}

export function useAssignTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      assignedUserId,
    }: {
      id: string;
      assignedUserId: string | null;
    }) => assignTask(id, assignedUserId),
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.setQueryData(taskKeys.detail(updatedTask.id), updatedTask);
      toast.success('Task assigned', {
        description: updatedTask.assignedUser
          ? `Assigned to ${updatedTask.assignedUser.name}.`
          : 'Task unassigned.',
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to assign task', {
        description: error.message,
      });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });

      const previousLists = queryClient.getQueriesData<
        PaginatedResponse<Task>
      >({ queryKey: taskKeys.lists() });

      // Optimistic remove
      queryClient.setQueriesData<PaginatedResponse<Task>>(
        { queryKey: taskKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((task) => task.id !== id),
            meta: { ...old.meta, total: old.meta.total - 1 },
          };
        },
      );

      return { previousLists };
    },
    onError: (error: Error, _id, context) => {
      if (context?.previousLists) {
        context.previousLists.forEach(([key, data]) => {
          if (data) queryClient.setQueryData(key, data);
        });
      }
      toast.error('Failed to delete task', {
        description: error.message,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
    onSuccess: () => {
      toast.success('Task deleted');
    },
  });
}
