import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import type { BlogPost } from '../../types/blog';

interface Props {
  posts: BlogPost[];
}

export const RecentPostsWidget: React.FC<Props> = ({ posts }) => {
  const recent = posts.slice(0, 4);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h3 className="font-serif font-bold text-[#0F172A] text-base mb-4">Recent Posts</h3>
      <ul className="space-y-4" role="list">
        {recent.map((post) => (
          <li key={post.id}>
            <Link
              to={`/blog/${post.slug}`}
              className="flex gap-3 group"
              aria-label={post.title}
            >
              <div className="w-[60px] h-[60px] rounded-xl overflow-hidden shrink-0">
                <img
                  src={post.image}
                  alt={post.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-400"
                />
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <p className="text-sm font-semibold text-[#0F172A] line-clamp-2 group-hover:text-[#0891B2] transition-colors leading-snug">
                  {post.title}
                </p>
                <span className="flex items-center gap-1 text-xs text-[#94A3B8] mt-1">
                  <Calendar size={10} />
                  {post.publishedAt}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
