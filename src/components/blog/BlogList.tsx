import React from 'react';
import { FileSearch } from 'lucide-react';
import { BlogCard } from './BlogCard';
import type { BlogPost } from '../../types/blog';

// Skeleton loader for a single card
const BlogCardSkeleton: React.FC = () => (
  <div className="flex flex-col sm:flex-row bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-pulse">
    <div className="sm:w-[240px] h-[200px] sm:h-auto bg-slate-200 shrink-0" />
    <div className="flex flex-col gap-3 flex-grow p-5 md:p-6">
      <div className="w-20 h-5 bg-slate-200 rounded-full" />
      <div className="w-full h-6 bg-slate-200 rounded" />
      <div className="w-4/5 h-6 bg-slate-200 rounded" />
      <div className="w-full h-4 bg-slate-100 rounded mt-1" />
      <div className="w-3/5 h-4 bg-slate-100 rounded" />
      <div className="mt-auto flex justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-slate-200 rounded-full" />
          <div className="w-32 h-3 bg-slate-200 rounded" />
        </div>
        <div className="w-20 h-4 bg-slate-200 rounded" />
      </div>
    </div>
  </div>
);

interface Props {
  posts: BlogPost[];
  isLoading?: boolean;
  searchTerm?: string;
  selectedCategory?: string;
}

export const BlogList: React.FC<Props> = ({
  posts,
  isLoading = false,
  searchTerm = '',
  selectedCategory = '',
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        {[1, 2, 3].map((i) => (
          <BlogCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
          <FileSearch size={36} className="text-slate-400" />
        </div>
        <h3 className="font-serif text-xl font-bold text-[#0F172A] mb-2">No articles found</h3>
        <p className="text-[#64748B] text-sm max-w-xs">
          {searchTerm
            ? `No results for "${searchTerm}". Try a different search term.`
            : selectedCategory
            ? `No articles in "${selectedCategory}" yet. Check back soon!`
            : 'No articles available at the moment.'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {posts.map((post, index) => (
        <BlogCard key={post.id} post={post} index={index} />
      ))}
    </div>
  );
};
