import React, { useState } from 'react';
import { useNewsletter, useDeleteSubscriber } from '../../hooks/useNewsletter';
import { DataTable } from '../../components/tables/DataTable';
import type { Column } from '../../components/tables/DataTable';
import { Mail, Download, Trash2, Search, Loader2 } from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import type { NewsletterSubscriber } from '../../types/admin';

export const NewsletterPage: React.FC = () => {
  const { data: subscribers = [], isLoading } = useNewsletter();
  const deleteSubscriber = useDeleteSubscriber();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSubscribers = React.useMemo(() => {
    return subscribers.filter((sub) =>
      sub.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [subscribers, searchTerm]);

  const handleDelete = (sub: NewsletterSubscriber) => {
    if (window.confirm(`Remove ${sub.email} from subscriber list?`)) {
      deleteSubscriber.mutate({ id: sub.id, email: sub.email });
    }
  };

  const handleExportCSV = () => {
    const headers = 'ID,Email,Subscribed At\n';
    const rows = subscribers
      .map((sub) => `${sub.id},${sub.email},${sub.subscribed_at}`)
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns: Column<NewsletterSubscriber>[] = [
    {
      key: 'email',
      header: 'Subscriber Email',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/20 text-cyan-500 flex items-center justify-center shrink-0">
            <Mail size={14} />
          </div>
          <span className="font-semibold text-slate-900 dark:text-white">{row.email}</span>
        </div>
      )
    },
    {
      key: 'subscribed_at',
      header: 'Date Subscribed',
      sortable: true,
      render: (row) => <span className="text-xs">{formatDate(row.subscribed_at)}</span>
    },
    {
      key: 'id',
      header: 'Actions',
      render: (row) => (
        <button
          onClick={() => handleDelete(row)}
          disabled={deleteSubscriber.isPending}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-red-500 rounded-lg transition cursor-pointer"
          title="Delete subscriber"
        >
          <Trash2 size={14} />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">
            Newsletter Subscribers
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monitor and export subscribers mailing datasets.
            {!isLoading && (
              <span className="ml-2 font-semibold text-cyan-600">{subscribers.length} total</span>
            )}
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={subscribers.length === 0}
          className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-60 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/10 cursor-pointer"
        >
          <Download size={15} /> Export CSV
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          placeholder="Search subscribers list by email address..."
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

      {!isLoading && (
        <DataTable
          columns={columns}
          data={filteredSubscribers}
          getRowId={(row) => row.id}
        />
      )}
    </div>
  );
};
export default NewsletterPage;
