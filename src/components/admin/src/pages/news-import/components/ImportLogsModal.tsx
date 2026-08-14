import React from 'react';
import { X, AlertTriangle, CheckCircle2, History, RefreshCw, Zap, Clock, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
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
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 flex items-center justify-center text-[#0891B2]">
              <History size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                News Synchronization Logs
              </h2>
              <p className="text-xs text-slate-500">
                Audit trail for hourly automatic and manual Jalore news ingestion runs
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw size={12} />
              Refresh
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
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {logs.length === 0 ? (
            <div className="text-center py-16 text-slate-500 space-y-2">
              <History size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No import logs recorded yet</p>
              <p className="text-xs text-slate-400">Run a news sync from the dashboard to view activity logs here.</p>
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold uppercase border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Status & Type</th>
                    <th className="py-3 px-4">Trigger</th>
                    <th className="py-3 px-4">Batch Metrics / Details</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {logs.map((log) => {
                    const isBatch = log.status === 'batch_completed' || log.status === 'batch_failed';
                    const isSuccess = log.status === 'imported' || log.status === 'batch_completed';
                    const isDuplicate = log.status === 'skipped_duplicate';

                    return (
                      <tr key={log.id} className={`hover:bg-slate-50 dark:hover:bg-slate-900/40 ${isBatch ? 'bg-slate-50/50 dark:bg-slate-900/20 font-medium' : ''}`}>
                        {/* Status */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 font-semibold px-2.5 py-1 rounded-lg text-[11px] ${
                              isSuccess
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                : isDuplicate
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                            }`}
                          >
                            {isSuccess ? <CheckCircle2 size={12} /> : isDuplicate ? <Clock size={12} /> : <AlertTriangle size={12} />}
                            {log.status === 'batch_completed'
                              ? 'Batch Done'
                              : log.status === 'batch_failed'
                              ? 'Batch Failed'
                              : log.status}
                          </span>
                        </td>

                        {/* Trigger */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                            {log.triggered_by === 'manual' ? (
                              <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-semibold">
                                <Zap size={11} /> Manual
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-slate-500">
                                <Clock size={11} /> 1h Cron
                              </span>
                            )}
                          </span>
                        </td>

                        {/* Details / Metrics */}
                        <td className="py-3 px-4">
                          {isBatch ? (
                            <div className="flex flex-wrap items-center gap-2 text-[11px]">
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {log.discovered_count ?? 0} Discovered
                              </span>
                              <span className="text-slate-300 dark:text-slate-700">•</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                +{log.imported_count ?? 0} Imported
                              </span>
                              <span className="text-slate-300 dark:text-slate-700">•</span>
                              <span className="text-slate-500">
                                {log.duplicate_count ?? 0} Duplicates
                              </span>
                              {(log.failed_count ?? 0) > 0 && (
                                <>
                                  <span className="text-slate-300 dark:text-slate-700">•</span>
                                  <span className="text-rose-600 dark:text-rose-400 font-semibold">
                                    {log.failed_count} Failed
                                  </span>
                                </>
                              )}
                              {log.error_message && (
                                <p className="text-rose-600 dark:text-rose-400 text-[10px] w-full mt-0.5 font-mono">
                                  {log.error_message}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="max-w-md truncate">
                              {log.error_message ? (
                                <span className="text-rose-600 dark:text-rose-400 font-mono text-[11px]">
                                  {log.error_message}
                                </span>
                              ) : log.source_url ? (
                                <a
                                  href={log.source_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#0891B2] hover:underline font-mono text-[11px] truncate block"
                                >
                                  {log.source_url}
                                </a>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Duration */}
                        <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                          {log.duration_ms ? `${(log.duration_ms / 1000).toFixed(1)}s` : '—'}
                        </td>

                        {/* Timestamp */}
                        <td className="py-3 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                          {new Date(log.created_at).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}{' '}
                          <span className="text-slate-400 text-[10px]">
                            ({new Date(log.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between text-xs text-slate-500">
          <span>Target Source: Dainik Bhaskar Jalore Local News</span>
          <button
            onClick={() => {
              const logsText = JSON.stringify(logs, null, 2);
              navigator.clipboard.writeText(logsText);
              toast.success('Logs JSON copied to clipboard!');
            }}
            className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            <Copy size={12} />
            Copy Full Logs JSON
          </button>
        </div>
      </div>
    </div>
  );
};
