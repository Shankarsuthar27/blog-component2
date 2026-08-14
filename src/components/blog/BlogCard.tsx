import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { BlogPost } from '../../types/blog';

interface Props {
  post: BlogPost;
  index?: number;
}

export const BlogCard: React.FC<Props> = ({ post, index = 0 }) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: 'easeOut' }}
      className="group flex flex-col sm:flex-row bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
      {/* Thumbnail */}
      <div className="sm:w-[240px] shrink-0 overflow-hidden relative">
        <div className="h-[200px] sm:h-full">
          <img
            src={post.image}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        </div>
        {/* Category overlay badge */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#D80408] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
          {post.category}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between flex-grow p-5 md:p-6">
        <div>
          {/* Category badge (hidden on mobile, shown in image overlay) */}
          <span className="hidden sm:inline-block bg-cyan-50 text-[#D80408] text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider border border-cyan-100 mb-3">
            {post.category}
          </span>

          {/* Title */}
          <h2 className="font-serif text-lg md:text-xl font-bold text-[#0F172A] leading-snug mb-3 line-clamp-2 group-hover:text-[#D80408] transition-colors duration-200">
            {post.title}
          </h2>

          {/* Excerpt */}
          <p className="text-sm text-[#64748B] leading-relaxed line-clamp-2 mb-4">
            {post.excerpt}
          </p>
        </div>

        {/* Footer meta */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2.5">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
            />
            <div className="text-xs text-[#64748B]">
              <span className="font-medium text-[#111827]">{post.author.name}</span>
              <span className="mx-1.5">·</span>
              <span className="inline-flex items-center gap-1">
                <Calendar size={10} />
                {post.publishedAt}
              </span>
              <span className="mx-1.5">·</span>
              <span className="inline-flex items-center gap-1">
                <Clock size={10} />
                {post.readingTime}
              </span>
            </div>
          </div>

          <Link
            to={post.isNews ? `/news/${post.slug}` : `/blog/${post.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#D80408] hover:text-[#F97316] transition-colors duration-200 group/link"
            aria-label={`Read more about ${post.title}`}
          >
            Read More
            <ArrowRight
              size={15}
              className="transition-transform duration-200 group-hover/link:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </motion.article>
  );
};
