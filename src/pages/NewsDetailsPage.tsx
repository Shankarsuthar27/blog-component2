import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Eye, Tag, Link2, Share2, Check, Newspaper, Sparkles, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { NewsCard } from '../components/blog/NewsCard';
import { supabase } from '../lib/supabase/client';
import type { NewsArticle } from '../types/news';

export const NewsDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  useEffect(() => {
    if (!slug) return;

    const fetchArticle = async () => {
      setIsLoading(true);
      setNotFound(false);

      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('slug', slug)
        .in('status', ['published', 'approved', 'pending'])
        .single();

      if (error || !data) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      setArticle(data as NewsArticle);

      // Increment view count atomically
      try {
        const { error: rpcErr } = await supabase.rpc('increment_news_views', { p_article_id: data.id });
        if (rpcErr) {
          // Fallback direct view count update
          await supabase
            .from('news_articles')
            .update({ views: (data.views || 0) + 1 })
            .eq('id', data.id);
        }
      } catch (e) {
        // Silently catch
      }

      // Fetch related published/approved news
      const { data: relatedData } = await supabase
        .from('news_articles')
        .select('*')
        .in('status', ['published', 'approved'])
        .neq('id', data.id)
        .limit(3);

      setRelatedArticles((relatedData as NewsArticle[]) || []);
      setIsLoading(false);
    };

    fetchArticle();
  }, [slug]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    toast.success('News article link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#D80408] border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center px-4">
            <div className="font-serif text-8xl font-bold text-slate-200 mb-4">404</div>
            <h1 className="font-serif text-2xl font-bold text-[#0F172A] mb-3">News Article Not Found</h1>
            <p className="text-[#64748B] mb-8">The requested news article is either pending approval or does not exist.</p>
            <Link
              to="/news"
              className="inline-flex items-center gap-2 bg-[#D80408] hover:bg-[#0e7490] text-white font-medium px-6 py-3 rounded-xl transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Jalore News
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // JSON-LD NewsArticle structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    'headline': article.title,
    'description': article.seo_description || article.excerpt,
    'image': [article.featured_image],
    'datePublished': article.published_at || article.created_at,
    'dateModified': article.updated_at,
    'author': {
      '@type': 'Organization',
      'name': article.source_name || 'Dainik Bhaskar',
      'url': article.source_url,
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Daily Bharat News',
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': window.location.href,
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Inject JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />

      <main className="flex-grow">
        {/* Top Hero Media Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative h-[320px] md:h-[480px] overflow-hidden"
        >
          <img
            src={article.featured_image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200'}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-[#0F172A]/40 to-transparent" />
        </motion.div>

        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Overlapping Content Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 -mt-20 md:-mt-32 relative z-10 mb-12 overflow-hidden"
          >
            <div className="max-w-3xl mx-auto px-6 md:px-12 py-10 md:py-14">
              {/* Top Navigation & Category */}
              <div className="flex items-center justify-between gap-4 mb-6">
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#64748B] hover:text-[#D80408] transition-colors group"
                >
                  <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
                  Back to Jalore News
                </button>

                <span className="inline-flex items-center gap-1 bg-cyan-50 text-[#D80408] text-xs font-bold px-3 py-1.5 rounded-full border border-cyan-200 uppercase tracking-wider">
                  <Tag size={12} />
                  {article.category || 'Jalore'}
                </span>
              </div>

              {/* Title */}
              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-[#0F172A] leading-tight mb-6">
                {article.title}
              </h1>

              {/* Meta Row */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-100 text-xs text-[#64748B]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 font-medium text-[#0F172A]">
                    <MapPin size={14} className="text-[#D80408]" />
                    {article.location || 'Jalore, Rajasthan'}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={13} />
                    {article.source_published_at
                      ? new Date(article.source_published_at).toLocaleDateString('hi-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'Today'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1">
                    <Eye size={13} /> {article.views.toLocaleString()} views
                  </span>
                </div>
              </div>

              {/* AI Summary Highlight Box */}
              {article.summary && (
                <div className="mb-8 p-5 bg-gradient-to-r from-cyan-50 to-emerald-50/50 border border-cyan-200/80 rounded-2xl">
                  <div className="flex items-center gap-2 text-[#0891B2] font-bold text-xs uppercase tracking-wider mb-2">
                    <Sparkles size={16} /> AI Summary / मुख्य बातें
                  </div>
                  <p className="text-[#334155] text-sm md:text-base leading-relaxed font-medium">
                    {article.summary}
                  </p>
                </div>
              )}

              {/* Video Player Embed (if present) */}
              {article.video_url && (
                <div className="mb-10 rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-black">
                  <div className="p-3 bg-[#0F172A] text-white text-xs font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    News Video Report / समाचार वीडियो
                  </div>
                  <div className="aspect-video w-full">
                    {article.video_url.includes('youtube') || article.video_url.includes('youtu.be') || article.video_url.includes('embed') ? (
                      <iframe
                        src={
                          article.video_url.includes('watch?v=')
                            ? article.video_url.replace('watch?v=', 'embed/')
                            : article.video_url
                        }
                        title={article.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video controls className="w-full h-full object-cover">
                        <source src={article.video_url} />
                        Your browser does not support HTML5 video player.
                      </video>
                    )}
                  </div>
                </div>
              )}

              {/* Main Article Content */}
              <div
                className="prose prose-slate max-w-none text-[#1E293B] leading-relaxed prose-headings:font-serif prose-a:text-[#D80408] prose-img:rounded-xl mb-10"
                dangerouslySetInnerHTML={{ __html: article.content || `<p>${article.excerpt}</p>` }}
              />

              {/* Gallery Images Grid (if present) */}
              {article.gallery_images && article.gallery_images.length > 0 && (
                <div className="mb-10 space-y-3">
                  <h3 className="font-serif font-bold text-lg text-[#0F172A]">Photo Gallery / समाचार चित्र</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {article.gallery_images.map((imgUrl, i) => (
                      <div key={i} className="h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm hover:shadow-md transition">
                        <img
                          src={imgUrl}
                          alt={`Gallery ${i + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* End of Article Content */}

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-6 border-t border-slate-100">
                  <span className="text-xs font-bold text-[#64748B] mr-2">Tags:</span>
                  {article.tags.map((t) => (
                    <span key={t} className="text-xs bg-slate-100 text-[#475569] px-3 py-1 rounded-full font-medium">
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* Share Row */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
                <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                  <Share2 size={14} className="text-[#D80408]" /> Share News:
                </span>
                <button
                  onClick={copyLink}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                    copiedLink
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      : 'bg-slate-100 text-[#64748B] hover:bg-[#D80408] hover:text-white border-transparent'
                  }`}
                >
                  {copiedLink ? <Check size={14} /> : <Link2 size={14} />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section className="mb-20 max-w-3xl mx-auto">
              <h2 className="font-serif text-2xl font-bold text-[#0F172A] mb-6 flex items-center gap-2">
                <Newspaper className="text-[#D80408]" size={24} />
                Related Jalore News
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((rel) => (
                  <NewsCard key={rel.id} article={rel} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
