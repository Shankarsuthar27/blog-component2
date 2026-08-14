import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Edit3, CheckCircle2, XCircle, Calendar, Tag, Newspaper, Play, Eye } from 'lucide-react';
import type { NewsArticle } from '../../../../../../types/news';

interface NewsCardProps {
  article: NewsArticle;
  onEdit: (article: NewsArticle) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onPublish?: (id: string) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  article,
  onEdit,
  onApprove,
  onReject,
  onPublish,
}) => {
  const isPending = article.status === 'pending';
  const isApproved = article.status === 'approved';
  const isPublished = article.status === 'published';
  const isRejected = article.status === 'rejected';

  return (
    <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
      {/* Image Header with Badge */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={article.featured_image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800'}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800';
          }}
        />
        {article.video_url && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-[#D80408]/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Play size={18} className="fill-white ml-0.5" />
            </div>
          </div>
        )}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="bg-[#0F172A]/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
            <Newspaper size={12} className="text-[#0891B2]" />
            {article.source_name || 'Dainik Bhaskar'}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm ${
              isPending
                ? 'bg-amber-500 text-white'
                : isApproved
                ? 'bg-emerald-500 text-white'
                : isPublished
                ? 'bg-cyan-600 text-white'
                : 'bg-rose-500 text-white'
            }`}
          >
            {article.status}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Metadata Row */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Tag size={12} className="text-[#0891B2]" />
              {article.category || 'Jalore'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {article.source_published_at
                ? new Date(article.source_published_at).toLocaleDateString('hi-IN', {
                    day: 'numeric',
                    month: 'short',
                  })
                : 'Recently'}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-serif font-bold text-slate-900 dark:text-white text-base leading-snug line-clamp-2 group-hover:text-[#0891B2] transition">
            {article.title}
          </h3>

          {/* Excerpt / Summary */}
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {article.summary || article.excerpt || 'No summary available.'}
          </p>
        </div>

        {/* Source link & Action Buttons */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <a
              href={article.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-medium text-[#0891B2] hover:underline flex items-center gap-1"
            >
              View Source <ExternalLink size={10} />
            </a>
            <span className="text-[10px] text-slate-400 font-mono">
              Views: {article.views || 0}
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Link
              to={`/news/${article.slug}`}
              target="_blank"
              className="py-2 px-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-[#0891B2] dark:text-cyan-400 hover:bg-cyan-100 text-xs font-semibold flex items-center justify-center gap-1 transition"
              title="View News Article"
            >
              <Eye size={14} />
              View
            </Link>

            <button
              onClick={() => onEdit(article)}
              className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Edit3 size={14} />
              Edit
            </button>
          </div>

          {isPending && (
            <>
              <button
                onClick={() => onReject(article.id)}
                className="py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                title="Reject Article"
              >
                <XCircle size={14} />
                Reject
              </button>
              <button
                onClick={() => onApprove(article.id)}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#0891B2] to-[#0EA5E9] text-white hover:opacity-90 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <CheckCircle2 size={14} />
                Approve
              </button>
            </>
          )}

          {isApproved && onPublish && (
            <button
              onClick={() => onPublish(article.id)}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <CheckCircle2 size={14} />
              Publish Live
            </button>
          )}

          {isRejected && (
            <button
              onClick={() => onApprove(article.id)}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
            >
              Re-open
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
