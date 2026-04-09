'use client';

import {
  Calendar,
  Clock,
  MoreVertical,
  Pencil,
  Trash2,
  UserPlus,
  ArrowRightLeft,
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Task, TaskStatus } from '@/lib/types';
import { formatRelative, formatDate, cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/store/auth';
import { useState } from 'react';

// ── Status config ───────────────────────────────────────────

const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'info' | 'destructive' }
> = {
  TODO: { label: 'To Do', variant: 'secondary' },
  IN_PROGRESS: { label: 'In Progress', variant: 'info' },
  IN_REVIEW: { label: 'In Review', variant: 'warning' },
  DONE: { label: 'Done', variant: 'success' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
};

// ── Props ───────────────────────────────────────────────────

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onStatusChange?: (task: Task) => void;
  onAssign?: (task: Task) => void;
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  onAssign,
}: TaskCardProps) {
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const [showActions, setShowActions] = useState(false);
  const statusConfig = STATUS_CONFIG[task.status];

  return (
    <Card className={cn(
      "group relative transition-all duration-200 hover:shadow-lg hover:border-primary/30 bg-card/50 backdrop-blur-sm",
      showActions ? "z-30" : "z-0"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight truncate text-foreground">
              {task.title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
            {/* Action menu button */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setShowActions(!showActions)}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
              {showActions && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowActions(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-md border border-border bg-popover p-1 shadow-lg animate-in fade-in-0 zoom-in-95">
                    {/* Status change — available for all roles */}
                    <button
                      className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent transition-colors"
                      onClick={() => {
                        setShowActions(false);
                        onStatusChange?.(task);
                      }}
                    >
                      <ArrowRightLeft className="h-3.5 w-3.5" />
                      Change Status
                    </button>

                    {/* Admin-only actions */}
                    {isAdmin && (
                      <>
                        <button
                          className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent transition-colors"
                          onClick={() => {
                            setShowActions(false);
                            onEdit?.(task);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit Task
                        </button>
                        <button
                          className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent transition-colors"
                          onClick={() => {
                            setShowActions(false);
                            onAssign?.(task);
                          }}
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                          Assign
                        </button>
                        <div className="my-1 h-px bg-border" />
                        <button
                          className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                          onClick={() => {
                            setShowActions(false);
                            onDelete?.(task);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {task.description}
          </p>
        )}

        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {task.assignedUser && (
            <span className="inline-flex items-center gap-1">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                {task.assignedUser.name.charAt(0).toUpperCase()}
              </span>
              {task.assignedUser.name}
            </span>
          )}
          {task.dueDate && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0 pb-3">
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
          <Clock className="h-3 w-3" />
          {formatRelative(task.updatedAt)}
        </div>
      </CardFooter>
    </Card>
  );
}
