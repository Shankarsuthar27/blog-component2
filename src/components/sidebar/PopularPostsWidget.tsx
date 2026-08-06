import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Clock } from 'lucide-react';
import type { BlogPost } from '../../types/blog';

interface Props {
  posts: BlogPost[];
}

export const PopularPostsWidget: React.FC<Props> = ({ posts }) => {
  const popular = [...posts]
    .sort((a, b) => b.views - a.views)
    .slice(0, 3);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h3 className="font-serif font-bold text-[#0F172A] text-base mb-4">Popular Posts</h3>
      <ol className="space-y-4" role="list">
        {popular.map((post, index) => (
          <li key={post.id} className="flex gap-4 group">
            <span
              aria-hidden="true"
              className="font-serif text-3xl font-bold text-slate-100 select-none shrink-0 leading-none mt-1 w-8 text-center group-hover:text-cyan-100 transition-colors"
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="min-w-0">
              <Link
                to={`/blog/${post.slug}`}
                className="text-sm font-semibold text-[#0F172A] line-clamp-2 group-hover:text-[#0891B2] transition-colors leading-snug block"
              >
                {post.title}
              </Link>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-[#94A3B8]">
                <span className="flex items-center gap-1">
                  <Eye size={10} />
                  {post.views.toLocaleString()} views
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={10} />
                  {post.readingTime}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};
