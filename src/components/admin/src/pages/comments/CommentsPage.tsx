import React, { useState } from 'react';
import { useComments, useUpdateCommentStatus, useDeleteComment } from '../../hooks/useComments';
import { DataTable } from '../../components/tables/DataTable';
import type { Column } from '../../components/tables/DataTable';
import { Check, X, ShieldAlert, Trash2, Mail, Loader2 } from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import type { Comment } from '../../types/admin';

export const CommentsPage: React.FC = () => {
  const { data: comments = [], isLoading } = useComments();
  const updateStatus = useUpdateCommentStatus();
  const deleteComment = useDeleteComment();

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'spam'>('all');

  const filteredComments = React.useMemo(() => {
    if (activeTab === 'all') return comments;
    return comments.filter((c) => c.status === activeTab);
  }, [comments, activeTab]);

  const pendingCount = comments.filter((c) => c.status === 'pending').length;

  const columns: Column<Comment>[] = [
    {
      key: 'name',
      header: 'Author',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-white block">{row.name}</span>
          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
            <Mail size={10} /> {row.email}
          </span>
        </div>
      )
    },
    {
      key: 'comment',
      header: 'Comment',
      render: (row) => (
        <div className="max-w-md">
          <p className="text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed text-xs">{row.comment}</p>
          <span className="text-[9px] text-slate-400 block mt-1.5 truncate">
            Post: {row.blog_title}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
          row.status === 'approved'
            ? 'bg-emerald-50 text-emerald-600'
            : row.status === 'pending'
            ? 'bg-amber-50 text-amber-600 animate-pulse'
            : 'bg-red-50 text-red-600'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (row) => <span className="text-xs">{formatDate(row.created_at)}</span>
    },
    {
      key: 'id',
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-1">
          {row.status !== 'approved' && (
            <button
              onClick={() => updateStatus.mutate({ id: row.id, status: 'approved' })}
              disabled={updateStatus.isPending}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-emerald-500 rounded-lg transition cursor-pointer"
              title="Approve"
            >
              <Check size={14} />
            </button>
          )}
          {row.status !== 'rejected' && row.status !== 'spam' && (
            <button
              onClick={() => updateStatus.mutate({ id: row.id, status: 'rejected' })}
              disabled={updateStatus.isPending}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-500 rounded-lg transition cursor-pointer"
              title="Reject"
            >
              <X size={14} />
            </button>
          )}
          {row.status !== 'spam' && (
            <button
              onClick={() => updateStatus.mutate({ id: row.id, status: 'spam' })}
              disabled={updateStatus.isPending}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-amber-500 rounded-lg transition cursor-pointer"
              title="Mark as Spam"
            >
              <ShieldAlert size={14} />
            </button>
          )}
          <button
            onClick={() => {
              if (window.confirm('Delete comment permanently?')) {
                deleteComment.mutate(row.id);
              }
            }}
            disabled={deleteComment.isPending}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-red-500 rounded-lg transition cursor-pointer"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">
          Comments Moderation
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review, approve, flag, or reject comments submitted by readers.
          {pendingCount > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 bg-amber-50 text-amber-600 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
              {pendingCount} pending
            </span>
          )}
        </p>
      </div>

      {/* Segment Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        {(['all', 'pending', 'approved', 'spam'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider transition relative cursor-pointer ${
              activeTab === tab
                ? 'text-cyan-500'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            {tab}
            {tab === 'pending' && pendingCount > 0 && (
              <span className="ml-1 inline-flex w-4 h-4 items-center justify-center bg-amber-500 text-white text-[9px] rounded-full">
                {pendingCount}
              </span>
            )}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-cyan-500" size={32} />
        </div>
      )}

      {!isLoading && (
        <DataTable
          columns={columns}
          data={filteredComments}
          getRowId={(row) => row.id}
        />
      )}
    </div>
  );
};
export default CommentsPage;
