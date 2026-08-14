import React from 'react';
import { X, AlertTriangle, CheckCircle2, History, RefreshCw } from 'lucide-react';
import type { NewsImportLog } from '../../../../../../types/news';

interface ImportLogsModalProps {
  logs: NewsImportLog[];
  onClose: () => void;
  onRefresh: () => void;
}

export const ImportLogsModal: React.FC<ImportLogsModalProps> = ({
  logs,
  onClose,
  onRefresh,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <History size={20} className="text-[#0891B2]" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              News Import Ingestion Logs
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 transition cursor-pointer"
            >
              <RefreshCw size={12} />
              Refresh Logs
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="p-6 overflow-y-auto flex-1">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No import logs recorded yet. Run a news sync to generate activity logs.
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold uppercase border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4">Source URL / Error Message</th>
                    <th className="py-3 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {logs.map((log) => {
                    const isSuccess = log.status === 'imported' || log.status === 'success';
                    return (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md text-[11px] ${
                              isSuccess
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                            }`}
                          >
                            {isSuccess ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold whitespace-nowrap">
                          {log.source_name || 'Dainik Bhaskar'}
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate">
                          {log.error_message ? (
                            <span className="text-rose-600 dark:text-rose-400 font-mono font-medium">
                              {log.error_message}
                            </span>
                          ) : (
                            <a
                              href={log.source_url || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#0891B2] hover:underline font-mono truncate block"
                            >
                              {log.source_url || '—'}
                            </a>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                          {new Date(log.created_at).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
