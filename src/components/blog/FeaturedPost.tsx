import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import type { BlogPost } from '../../types/blog';

interface Props {
  post: BlogPost;
}

export const FeaturedPost: React.FC<Props> = ({ post }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative group overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-shadow duration-500"
    >
      {/* Decorative background blobs */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-cyan-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-100/40 rounded-full blur-2xl pointer-events-none" />

      <div className="relative flex flex-col lg:flex-row min-h-[460px]">
        {/* Image */}
        <div className="lg:w-[55%] overflow-hidden relative">
          <div className="h-[280px] lg:h-full">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </div>
          {/* Gradient overlay for mobile */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent lg:hidden" />

          {/* Badges on image */}
          <div className="absolute top-5 left-5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-[#D80408] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wider">
              <Star size={11} className="fill-[#D80408]" />
              Featured Post
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="lg:w-[45%] p-8 lg:p-10 xl:p-12 flex flex-col justify-center relative">
          {/* Category Badge */}
          <span className="inline-block bg-cyan-50 text-[#D80408] text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider border border-cyan-200 mb-5 self-start">
            {post.category}
          </span>

          {/* Title */}
          <h1 className="font-serif text-2xl md:text-3xl xl:text-4xl font-bold text-[#0F172A] leading-tight mb-4 group-hover:text-[#D80408] transition-colors duration-300">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="text-[#64748B] text-sm md:text-base leading-relaxed mb-7 line-clamp-3">
            {post.excerpt}
          </p>

          {/* Author + Meta */}
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-11 h-11 rounded-full ring-2 ring-white shadow object-cover"
            />
            <div>
              <p className="text-sm font-semibold text-[#111827]">{post.author.name}</p>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-[#64748B]">
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  {post.publishedAt}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {post.readingTime}
                </span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Link
            to={post.isNews ? `/news/${post.slug}` : `/blog/${post.slug}`}
            className="inline-flex items-center gap-2.5 self-start bg-[#F97316] hover:bg-orange-600 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-0.5 group/btn"
          >
            Read Article
            <ArrowRight
              size={16}
              className="transition-transform duration-200 group-hover/btn:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
