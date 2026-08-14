import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Tag, ArrowRight, ShieldCheck, Newspaper, Play } from 'lucide-react';
import type { NewsArticle } from '../../types/news';

interface NewsCardProps {
  article: NewsArticle;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  return (
    <article className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Image & Category Tag */}
      <Link to={`/news/${article.slug}`} className="relative h-52 w-full overflow-hidden bg-slate-100 block">
        <img
          src={article.featured_image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800'}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800';
          }}
        />
        {article.video_url && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[#D80408]/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Play size={20} className="fill-white ml-0.5" />
            </div>
          </div>
        )}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="bg-[#D80408] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
            <Tag size={10} />
            {article.category || 'Jalore'}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="bg-[#0F172A]/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1">
            <Newspaper size={12} className="text-[#0891B2]" />
            {article.source_name}
          </span>
        </div>
      </Link>

      {/* Body Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar size={13} className="text-[#D80408]" />
              {article.source_published_at
                ? new Date(article.source_published_at).toLocaleDateString('hi-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'ताज़ा समाचार'}
            </span>
            <span className="text-[11px] font-semibold text-[#0891B2] bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-100">
              {article.location || 'जालोर'}
            </span>
          </div>

          {/* Title */}
          <h2 className="font-serif font-bold text-lg text-[#0F172A] leading-snug line-clamp-2 group-hover:text-[#D80408] transition-colors">
            <Link to={`/news/${article.slug}`}>{article.title}</Link>
          </h2>

          {/* Excerpt / Summary */}
          <p className="text-xs text-[#475569] leading-relaxed line-clamp-3">
            {article.summary || article.excerpt || article.title}
          </p>
        </div>

        {/* Source Attribution & Read More Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
            <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
            <span>Source: <strong className="text-[#0F172A]">{article.source_name}</strong></span>
          </div>

          <Link
            to={`/news/${article.slug}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#D80408] hover:text-[#0e7490] transition-colors group-hover:translate-x-1 duration-200"
          >
            Read More <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
};
