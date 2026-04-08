'use client';

import { QueryProvider } from '@/lib/providers/query-provider';
import { Toaster } from 'sonner';
import { Navigation } from '@/components/layout/Navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
      <Toaster
        position="bottom-right"
        theme="dark"
        richColors
        closeButton
      />
    </QueryProvider>
  );
}
