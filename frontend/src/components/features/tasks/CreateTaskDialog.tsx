'use client';

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
import { useCreateTask } from '@/lib/hooks/useTasks';
import { TaskStatus } from '@/lib/types';

// ── Validation schema ───────────────────────────────────────

const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be 255 characters or less'),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  assignedUserId: z.string().optional(),
  dueDate: z.string().optional(),
});

type CreateTaskFormValues = z.infer<typeof createTaskSchema>;

// ── Props ───────────────────────────────────────────────────

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users?: { id: string; name: string; email: string }[];
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  users = [],
}: CreateTaskDialogProps) {
  const createMutation = useCreateTask();

  const form = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: TaskStatus.TODO,
      assignedUserId: '',
      dueDate: '',
    },
  });

  async function onSubmit(values: CreateTaskFormValues) {
    try {
      await createMutation.mutateAsync({
        title: values.title,
        description: values.description || undefined,
        status: values.status,
        assignedUserId: values.assignedUserId || undefined,
        dueDate: values.dueDate || undefined,
      });
      form.reset();
      onOpenChange(false);
    } catch {
      // Error handled by mutation's onError
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new task.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter task description"
              rows={3}
              {...form.register('description')}
            />
          </div>

          {/* Status + Assignee row */}
          <div className="grid grid-cols-2 gap-4">
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
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TaskStatus.TODO}>To Do</SelectItem>
                  <SelectItem value={TaskStatus.IN_PROGRESS}>
                    In Progress
                  </SelectItem>
                  <SelectItem value={TaskStatus.IN_REVIEW}>
                    In Review
                  </SelectItem>
                  <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assignee */}
            <div className="space-y-2">
              <Label>Assign To</Label>
              <Select
                value={form.watch('assignedUserId') || ''}
                onValueChange={(val) =>
                  form.setValue('assignedUserId', val === 'none' ? '' : val)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input id="dueDate" type="date" {...form.register('dueDate')} />
          </div>

          {/* Actions */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
