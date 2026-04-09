'use client';

import { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Filter, LayoutGrid, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TaskCard,
  CreateTaskDialog,
  UpdateTaskDialog,
  UpdateStatusDialog,
  AssignTaskDialog,
} from '@/components/features/tasks';
import { useTasks, useDeleteTask } from '@/lib/hooks/useTasks';
import { useUsers } from '@/lib/hooks/useUsers';
import { useAuthStore } from '@/lib/store/auth';
import { TaskStatus, type Task } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const STATUS_FILTERS = [
  { value: 'ALL', label: 'All Tasks' },
  { value: TaskStatus.TODO, label: 'To Do' },
  { value: TaskStatus.IN_PROGRESS, label: 'In Progress' },
  { value: TaskStatus.IN_REVIEW, label: 'In Review' },
  { value: TaskStatus.DONE, label: 'Done' },
  { value: TaskStatus.CANCELLED, label: 'Cancelled' },
] as const;

export default function TasksPage() {
  const user = useAuthStore((s: any) => s.user);
  const isAdmin = useAuthStore((s: any) => s.isAdmin());

  const { data: usersData } = useUsers();
  const users = usersData ?? [];

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, searchQuery]);

  const queryParams = useMemo(
    () => ({
      page,
      status: statusFilter !== 'ALL' ? statusFilter : undefined,
      assignedUserId: !isAdmin ? user?.id : undefined,
      search: searchQuery || undefined,
      limit: 12,
    }),
    [page, statusFilter, searchQuery, isAdmin, user?.id],
  );

  const { data, isLoading, isError, error } = useTasks(queryParams);
  const deleteMutation = useDeleteTask();
  const tasks = data?.data ?? [];
  const totalCount = data?.meta?.total ?? 0;


  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [statusTask, setStatusTask] = useState<Task | null>(null);
  const [assignTask, setAssignTask] = useState<Task | null>(null);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);


  async function handleConfirmDelete() {
    if (!deleteTask) return;
    try {
      await deleteMutation.mutateAsync(deleteTask.id);
      setDeleteTask(null);
    } catch {
      
    }
  }

 
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach((t) => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });
    return counts;
  }, [tasks]);

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? `${totalCount} total tasks`
              : `${totalCount} tasks assigned to you`}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Task
          </Button>
        )}
      </div>


      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-9"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          />
        </div>

     
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

    
        <div className="hidden lg:flex items-center gap-1.5 ml-auto">
          {Object.entries(statusCounts).map(([status, count]) => (
            <Badge
              key={status}
              variant="outline"
              className="cursor-pointer hover:bg-accent transition-colors text-xs"
              onClick={() =>
                setStatusFilter(
                  statusFilter === status ? 'ALL' : status,
                )
              }
            >
              {status.replace(/_/g, ' ').toLowerCase()} ({count})
            </Badge>
          ))}
        </div>
      </div>


      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-destructive font-medium">Failed to load tasks</p>
          <p className="text-sm text-muted-foreground mt-1">
            {error?.message || 'An unexpected error occurred'}
          </p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <LayoutGrid className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="font-medium text-muted-foreground">No tasks found</p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            {statusFilter !== 'ALL'
              ? 'Try changing your filter.'
              : isAdmin
                ? 'Create your first task to get started.'
                : 'No tasks have been assigned to you yet.'}
          </p>
          {isAdmin && statusFilter === 'ALL' && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tasks.map((task: Task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={(t: Task) => setEditTask(t)}
              onDelete={(t: Task) => setDeleteTask(t)}
              onStatusChange={(t: Task) => setStatusTask(t)}
              onAssign={(t: Task) => setAssignTask(t)}
            />
          ))}
        </div>
      )}

 
      {/* Sticky Pagination Bar */}
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="sticky bottom-4 z-20 flex flex-col sm:flex-row justify-between items-center gap-4 bg-background/60 backdrop-blur-xl p-4 border border-white/10 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4">
           <p className="text-sm text-muted-foreground font-medium">
             Showing {tasks.length} of {data.meta.total} tasks
           </p>
           
           <div className="flex flex-wrap gap-2 items-center justify-center">
             <button
               onClick={() => setPage(1)}
               disabled={page === 1}
               className="px-3 py-1.5 bg-black/40 border border-white/10 rounded-md hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-xs transition-colors"
             >
               First
             </button>
             
             {Array.from({ length: data.meta.totalPages }, (_, i) => i + 1)
               .filter(p => p === 1 || p === data.meta.totalPages || Math.abs(p - page) <= 1)
               .map((pageNum, idx, arr) => (
                 <div key={pageNum} className="flex items-center">
                   {idx > 0 && arr[idx-1] !== pageNum - 1 && <span className="text-muted-foreground px-1">...</span>}
                   <button
                     onClick={() => setPage(pageNum)}
                     className={`px-3 py-1.5 border rounded-md text-xs transition-colors ${
                       page === pageNum 
                        ? 'bg-primary border-primary text-primary-foreground font-bold' 
                        : 'bg-black/40 border-white/10 hover:bg-white/10 text-muted-foreground'
                     }`}
                   >
                     {pageNum}
                   </button>
                 </div>
               ))
             }

             <button
               onClick={() => setPage(data.meta.totalPages)}
               disabled={page === data.meta.totalPages}
               className="px-3 py-1.5 bg-black/40 border border-white/10 rounded-md hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-xs transition-colors"
             >
               Last
             </button>
           </div>
        </div>
      )}


  
      <CreateTaskDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        users={users}
      />

  
      <UpdateTaskDialog
        task={editTask}
        open={!!editTask}
        onOpenChange={(open: boolean) => !open && setEditTask(null)}
      />

   
      <UpdateStatusDialog
        task={statusTask}
        open={!!statusTask}
        onOpenChange={(open: boolean) => !open && setStatusTask(null)}
      />


      <AssignTaskDialog
        task={assignTask}
        open={!!assignTask}
        onOpenChange={(open: boolean) => !open && setAssignTask(null)}
        users={users}
      />

   
      <Dialog
        open={!!deleteTask}
        onOpenChange={(open) => !open && setDeleteTask(null)}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteTask?.title}
              &rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTask(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
