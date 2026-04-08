'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateTaskStatus } from '@/lib/hooks/useTasks';
import type { Task } from '@/lib/types';
import { TaskStatus } from '@/lib/types';
import { useState, useEffect } from 'react';

// ── Props ───────────────────────────────────────────────────

interface UpdateStatusDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: TaskStatus.TODO, label: 'To Do' },
  { value: TaskStatus.IN_PROGRESS, label: 'In Progress' },
  { value: TaskStatus.IN_REVIEW, label: 'In Review' },
  { value: TaskStatus.DONE, label: 'Done' },
  { value: TaskStatus.CANCELLED, label: 'Cancelled' },
];

export function UpdateStatusDialog({
  task,
  open,
  onOpenChange,
}: UpdateStatusDialogProps) {
  const statusMutation = useUpdateTaskStatus();
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>(
    TaskStatus.TODO,
  );

  // Sync selected status when task changes
  useEffect(() => {
    if (task) {
      setSelectedStatus(task.status);
    }
  }, [task]);

  async function handleSubmit() {
    if (!task || selectedStatus === task.status) {
      onOpenChange(false);
      return;
    }

    try {
      await statusMutation.mutateAsync({
        id: task.id,
        status: selectedStatus,
      });
      onOpenChange(false);
    } catch {
      // Error handled by mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle>Update Status</DialogTitle>
          <DialogDescription>
            Change the status of &ldquo;{task?.title}&rdquo;
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <Label>New Status</Label>
          <Select
            value={selectedStatus}
            onValueChange={(val) => setSelectedStatus(val as TaskStatus)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedStatus === task?.status && (
            <p className="text-xs text-muted-foreground">
              Task is already in this status.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              statusMutation.isPending || selectedStatus === task?.status
            }
          >
            {statusMutation.isPending ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
