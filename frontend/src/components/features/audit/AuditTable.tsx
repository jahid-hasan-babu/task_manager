'use client';

import { useState } from 'react';
import type { AuditLog } from '@/lib/types';
import { format } from 'date-fns';

interface AuditTableProps {
  logs: AuditLog[];
  isLoading: boolean;
}

export function AuditTable({ logs, isLoading }: AuditTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 w-full bg-white/5 border border-white/10 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border border-white/10 rounded-lg bg-card/30">
        No audit logs found.
      </div>
    );
  }

  const getActionColor = (type: string) => {
    if (type.includes('CREATED')) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    if (type.includes('DELETED')) return 'text-red-400 bg-red-400/10 border-red-400/20';
    if (type.includes('UPDATED')) return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    if (type.includes('STATUS')) return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
    if (type.includes('ASSIGN')) return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
  };

  return (
    <div className="w-full text-sm">
      <div className="w-full bg-card/60 border border-border backdrop-blur-md rounded-lg overflow-hidden shadow-xl">
        <div className="grid grid-cols-12 gap-4 border-b border-border p-4 font-semibold text-muted-foreground">
          <div className="col-span-3">Timestamp</div>
          <div className="col-span-3">Actor</div>
          <div className="col-span-3">Action</div>
          <div className="col-span-3 text-right">Details</div>
        </div>

        <div className="divide-y divide-border">
          {logs.map((log) => {
            const isExpanded = expandedId === log.id;
            return (
              <div key={log.id} className="transition-colors hover:bg-white/5">
                <div 
                  className="grid grid-cols-12 gap-4 p-4 cursor-pointer items-center"
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                >
                  <div className="col-span-3 text-muted-foreground">
                    {format(new Date(log.createdAt), 'PPP HH:mm:ss')}
                  </div>
                  
                  <div className="col-span-3 flex flex-col">
                    <span className="font-medium text-foreground">{log.actor.name}</span>
                    <span className="text-xs text-muted-foreground">{log.actor.email}</span>
                  </div>
                  
                  <div className="col-span-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getActionColor(log.actionType)}`}>
                      {log.actionType.replace(/_/g, ' ')}
                    </span>
                  </div>
                  
                  <div className="col-span-3 text-right text-muted-foreground font-medium text-xs flex justify-end gap-2 items-center">
                     <span>{log.targetEntity} : {log.targetId.substring(0, 8)}...</span>
                     <svg className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                     </svg>
                  </div>
                </div>

                {isExpanded && log.metadata && (
                  <div className="p-4 bg-black/40 border-t border-white/5 font-mono text-xs overflow-x-auto text-primary-foreground/80">
                      <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
