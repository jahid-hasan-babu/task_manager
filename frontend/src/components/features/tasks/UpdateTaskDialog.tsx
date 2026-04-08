'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateTask } from '@/lib/hooks/useTasks';
import type { Task } from '@/lib/types';
import { TaskStatus } from '@/lib/types';

// ── Validation ──────────────────────────────────────────────

const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be 255 characters or less'),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus),
  dueDate: z.string().optional(),
});

type UpdateTaskFormValues = z.infer<typeof updateTaskSchema>;

// ── Props ───────────────────────────────────────────────────

interface UpdateTaskDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateTaskDialog({
  task,
  open,
  onOpenChange,
}: UpdateTaskDialogProps) {
  const updateMutation = useUpdateTask();

  const form = useForm<UpdateTaskFormValues>({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: TaskStatus.TODO,
      dueDate: '',
    },
  });

  // Populate form when task changes
  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description || '',
        status: task.status,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      });
    }
  }, [task, form]);

  async function onSubmit(values: UpdateTaskFormValues) {
    if (!task) return;

    try {
      await updateMutation.mutateAsync({
        id: task.id,
        input: {
          title: values.title,
          description: values.description || undefined,
          status: values.status,
          dueDate: values.dueDate || null,
        },
      });
      onOpenChange(false);
    } catch {
      // Error handled by mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update the task details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title *</Label>
            <Input
              id="edit-title"
              placeholder="Enter task title"
              {...form.register('title')}
            />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              placeholder="Enter task description"
              rows={3}
              {...form.register('description')}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={form.watch('status')}
              onValueChange={(val) =>
                form.setValue('status', val as TaskStatus)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TaskStatus.TODO}>To Do</SelectItem>
                <SelectItem value={TaskStatus.IN_PROGRESS}>
                  In Progress
                </SelectItem>
                <SelectItem value={TaskStatus.IN_REVIEW}>In Review</SelectItem>
                <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
                <SelectItem value={TaskStatus.CANCELLED}>Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="edit-dueDate">Due Date</Label>
            <Input
              id="edit-dueDate"
              type="date"
              {...form.register('dueDate')}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
