'use client';

import { useState } from 'react';
import { useAuditLogs } from '@/lib/hooks/useAuditLogs';
import { AuditTable } from '@/components/features/audit/AuditTable';
import { ActionType } from '@/lib/types';
import { Shield } from 'lucide-react';

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [actionType, setActionType] = useState<ActionType | ''>('');
  
  const { data, isLoading } = useAuditLogs({ 
    page, 
    limit: 20,
    actionType: actionType || undefined
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Shield className="text-primary w-8 h-8" />
            Audit Logs
          </h1>
          <p className="text-muted-foreground mt-1">
            System-wide track of actions and modifications.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-card/40 p-2 rounded-lg border border-border">
            <label className="text-sm font-medium text-muted-foreground mr-2">Filter Action:</label>
          <select
            className="bg-card/50 border border-white/10 text-foreground text-sm rounded-md focus:ring-primary focus:border-primary block p-2 outline-none"
            value={actionType}
            onChange={(e) => {
              setActionType(e.target.value as ActionType | '');
              setPage(1);
            }}
          >
            <option value="">All Actions</option>
            {Object.values(ActionType).map(type => (
              <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      <AuditTable logs={data?.data || []} isLoading={isLoading} />

      {/* Basic Pagination Controls */}
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex justify-between items-center bg-card/30 p-4 border border-border rounded-lg mt-6">
           <p className="text-sm text-muted-foreground font-medium">
             Showing page {data.meta.page} of {data.meta.totalPages} • Total Logs: {data.meta.total}
           </p>
           <div className="flex gap-2 text-sm font-medium">
             <button
               onClick={() => setPage(p => Math.max(1, p - 1))}
               disabled={page === 1}
               className="px-4 py-2 bg-black/40 border border-white/10 rounded-md hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
             >
               Previous
             </button>
             <button
               onClick={() => setPage(p => Math.min(data.meta.totalPages, p + 1))}
               disabled={page === data.meta.totalPages}
               className="px-4 py-2 bg-black/40 border border-white/10 rounded-md hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
             >
               Next
             </button>
           </div>
        </div>
      )}
    </div>
  );
}
