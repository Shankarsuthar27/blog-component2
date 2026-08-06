import React, { useState } from 'react';
import { useActivityLogs } from '../../hooks/useActivityLogs';
import { History, Loader2, Search, RefreshCw } from 'lucide-react';
import { formatDate, formatTime } from '../../utils/helpers';
import { useQueryClient } from '@tanstack/react-query';

const actionColors: Record<string, string> = {
  CREATE_BLOG: 'bg-emerald-50 text-emerald-600',
  PUBLISH_BLOG: 'bg-cyan-50 text-cyan-600',
  UPDATE_BLOG: 'bg-blue-50 text-blue-600',
  DELETE_BLOG: 'bg-red-50 text-red-600',
  CREATE_CATEGORY: 'bg-violet-50 text-violet-600',
  DELETE_CATEGORY: 'bg-red-50 text-red-600',
  APPROVE_COMMENT: 'bg-emerald-50 text-emerald-600',
  REJECT_COMMENT: 'bg-rose-50 text-rose-600',
  SPAM_COMMENT: 'bg-amber-50 text-amber-600',
  UPDATE_SETTINGS: 'bg-slate-100 text-slate-600',
};

export const ActivityLogsPage: React.FC = () => {
  const { data: logs = [], isLoading, isFetching } = useActivityLogs();
  const qc = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(
    (log) =>
      (log.details || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.user_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">
            Activity Logs
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Full audit trail of all admin operations. Auto-refreshes every 30 seconds.
          </p>
        </div>
        <button
          onClick={() => qc.invalidateQueries({ queryKey: ['activity_logs'] })}
          disabled={isFetching}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition cursor-pointer"
          title="Refresh"
        >
          <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          placeholder="Search logs by action, detail, or user..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs focus:outline-none focus:border-cyan-500 transition shadow-sm"
        />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-cyan-500" size={32} />
        </div>
      )}

      {!isLoading && filteredLogs.length === 0 && (
        <div className="text-center py-16 text-slate-400 text-sm">
          No activity logs found.
        </div>
      )}

      {!isLoading && filteredLogs.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
          {filteredLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-4 p-5 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
              <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                <History size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    actionColors[log.action] || 'bg-slate-100 text-slate-600'
                  }`}>
                    {log.action.replace(/_/g, ' ')}
                  </span>
                  {log.user_name && (
                    <span className="text-[10px] text-slate-400">by {log.user_name}</span>
                  )}
                </div>
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-1 leading-snug">
                  {log.details}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] text-slate-400">{formatDate(log.created_at)}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{formatTime(log.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default ActivityLogsPage;
