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
import { useAssignTask } from '@/lib/hooks/useTasks';
import type { Task } from '@/lib/types';
import { useState, useEffect } from 'react';

// ── Props ───────────────────────────────────────────────────

interface AssignTaskDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users?: { id: string; name: string; email: string }[];
}

export function AssignTaskDialog({
  task,
  open,
  onOpenChange,
  users = [],
}: AssignTaskDialogProps) {
  const assignMutation = useAssignTask();
  const [selectedUserId, setSelectedUserId] = useState<string>('none');

  // Sync when task changes
  useEffect(() => {
    if (task) {
      setSelectedUserId(task.assignedUserId || 'none');
    }
  }, [task]);

  async function handleSubmit() {
    if (!task) return;

    const assignId = selectedUserId === 'none' ? null : selectedUserId;

    // Skip if same as current
    if (assignId === task.assignedUserId) {
      onOpenChange(false);
      return;
    }

    try {
      await assignMutation.mutateAsync({
        id: task.id,
        assignedUserId: assignId,
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
          <DialogTitle>Assign Task</DialogTitle>
          <DialogDescription>
            Assign &ldquo;{task?.title}&rdquo; to a team member.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <Label>Assign To</Label>
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a user" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <span className="text-muted-foreground">Unassigned</span>
              </SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <span>{user.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {user.email}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={assignMutation.isPending}
          >
            {assignMutation.isPending ? 'Assigning...' : 'Assign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
