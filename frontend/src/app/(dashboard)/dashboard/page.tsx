'use client';

import { useTasks } from '@/lib/hooks/useTasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Circle, Clock, Layout } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: tasksData, isLoading } = useTasks();
  const tasks = tasksData?.data || [];

  const stats = [
    {
      title: 'Total Tasks',
      value: tasks.length,
      icon: Layout,
      color: 'text-blue-500',
    },
    {
      title: 'To Do',
      value: tasks.filter(t => t.status === 'TODO').length,
      icon: Circle,
      color: 'text-slate-400',
    },
    {
      title: 'In Progress',
      value: tasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'IN_REVIEW').length,
      icon: Clock,
      color: 'text-amber-500',
    },
    {
      title: 'Completed',
      value: tasks.filter(t => t.status === 'DONE').length,
      icon: CheckCircle2,
      color: 'text-emerald-500',
    },
  ];

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-muted rounded w-1/4"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted rounded-xl"></div>)}
      </div>
    </div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">Snapshot of your team's productivity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-card/50 backdrop-blur-sm border-white/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-card/30 rounded-2xl border border-white/5 p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Ready to work?</h2>
        <p className="text-muted-foreground mb-6">Head over to the tasks page to manage your workflow.</p>
        <Link 
          href="/tasks" 
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          View All Tasks
        </Link>
      </div>
    </div>
  );
}
