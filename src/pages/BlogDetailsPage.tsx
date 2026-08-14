import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Eye, Tag, Link2, MessageSquare, Send, Loader2, Share2, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { BlogCard } from '../components/blog/BlogCard';
import { supabase } from '../lib/supabase/client';
import type { BlogPost } from '../types/blog';

// Inline SVG brand icons
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);

function transformBlog(row: any, categories: any[]): BlogPost {
  const category = categories.find((c: any) => c.id === row.category_id);
  const profile = row.profiles;
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt || '',
    content: row.content || '',
    image: row.featured_image
      ? row.featured_image.replace('/storage/v1/object/media/', '/storage/v1/object/public/media/')
      : 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=1200',
    category: category?.name || 'General',
    author: {
      name: profile?.full_name || 'Daily Bharat',
      avatar: profile?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
      bio: '',
    },
    publishedAt: row.published_at
      ? new Date(row.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : new Date(row.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    readingTime: row.reading_time || '5 min read',
    views: row.views || 0,
    featured: row.featured || false,
    tags: row.blog_tags?.map((bt: any) => bt.tags?.name).filter(Boolean) || [],
  };
}

interface CommentData {
  id: string;
  name: string;
  email: string;
  comment: string;
  created_at: string;
  status: string;
}

export const BlogDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Comment form state
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  useEffect(() => {
    if (!slug) return;

    const fetchPost = async () => {
      setIsLoading(true);
      setNotFound(false);

      // Fetch categories for transformation
      const { data: cats } = await supabase
        .from('categories')
        .select('id, name, slug, color');
      const categories = cats || [];

      // Fetch the blog post with tags and author
      const { data: blogData, error } = await supabase
        .from('blogs')
        .select(`
          id, title, slug, excerpt, content, featured_image, category_id,
          reading_time, views, featured, published_at, created_at,
          profiles:author_id (full_name, avatar),
          blog_tags (tags (name))
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error || !blogData) {
        // Fallback check if it's an imported news article
        const { data: newsCheck } = await supabase
          .from('news_articles')
          .select('slug')
          .eq('slug', slug)
          .maybeSingle();

        if (newsCheck?.slug) {
          navigate(`/news/${newsCheck.slug}`, { replace: true });
          return;
        }

        setNotFound(true);
        setIsLoading(false);
        return;
      }

      const transformedPost = transformBlog(blogData, categories);
      setPost(transformedPost);

      // Increment view count atomically
      try {
        await supabase.rpc('increment_blog_views', { p_blog_id: blogData.id });
      } catch (e) {
        // Silently fail if RPC is not created yet
      }

      // Fetch approved comments
      const { data: commentsData } = await supabase
        .from('comments')
        .select('id, name, email, comment, created_at, status')
        .eq('blog_id', blogData.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: true });
      setComments(commentsData || []);

      // Fetch related posts (same category, different post)
      if (blogData.category_id) {
        const { data: relatedData } = await supabase
          .from('blogs')
          .select(`
            id, title, slug, excerpt, content, featured_image, category_id,
            reading_time, views, featured, published_at, created_at,
            profiles:author_id (full_name, avatar)
          `)
          .eq('status', 'published')
          .eq('category_id', blogData.category_id)
          .neq('id', blogData.id)
          .limit(3);
        setRelatedPosts((relatedData || []).map((r) => transformBlog(r, categories)));
      }

      setIsLoading(false);
    };

    fetchPost();
  }, [slug]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !commentName.trim() || !commentEmail.trim() || !commentText.trim()) return;

    setCommentSubmitting(true);
    try {
      const { error } = await supabase.from('comments').insert([{
        blog_id: post.id,
        name: commentName.trim(),
        email: commentEmail.trim(),
        comment: commentText.trim(),
        status: 'pending',
      }]);

      if (error) throw error;
      setCommentSuccess(true);
      setCommentName('');
      setCommentEmail('');
      setCommentText('');
    } catch (err) {
      console.error('Failed to submit comment:', err);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const [copiedLink, setCopiedLink] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    toast.success('Article link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="animate-spin text-[#D80408]" size={40} />
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center px-4">
            <div className="font-serif text-8xl font-bold text-slate-200 mb-4">404</div>
            <h1 className="font-serif text-2xl font-bold text-[#0F172A] mb-3">Article Not Found</h1>
            <p className="text-[#64748B] mb-8">The article you're looking for doesn't exist or has been moved.</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-[#D80408] hover:bg-[#0e7490] text-white font-medium px-6 py-3 rounded-xl transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Blog
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header />

      <main className="flex-grow">
        {/* Hero image */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative h-[300px] md:h-[480px] overflow-hidden"
        >
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-[#0F172A]/30 to-transparent" />
        </motion.div>

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Article card overlapping the hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 -mt-20 md:-mt-32 relative z-10 mb-12"
          >
            <div className="max-w-3xl mx-auto px-6 md:px-12 py-10 md:py-14">
              {/* Back Button */}
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#D80408] transition-colors mb-8 group"
              >
                <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
                Back to Blog
              </button>

              {/* Category */}
              <span className="inline-block bg-cyan-50 text-[#D80408] text-xs font-semibold px-3 py-1.5 rounded-full border border-cyan-200 uppercase tracking-wider mb-5">
                <Tag size={10} className="inline mr-1" />{post.category}
              </span>

              {/* Title */}
              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-[#0F172A] leading-tight mb-6">
                {post.title}
              </h1>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pb-8 mb-8 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#0F172A]">{post.author.name}</p>
                    {post.author.bio && (
                      <p className="text-xs text-[#64748B] max-w-xs leading-snug">{post.author.bio}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-[#94A3B8] ml-auto flex-wrap">
                  <span className="flex items-center gap-1.5"><Calendar size={12} />{post.publishedAt}</span>
                  <span className="flex items-center gap-1.5"><Clock size={12} />{post.readingTime}</span>
                  <span className="flex items-center gap-1.5"><Eye size={12} />{post.views.toLocaleString()} views</span>
                </div>
              </div>

              {/* Excerpt */}
              <p className="text-lg text-[#64748B] leading-relaxed border-l-4 border-[#D80408] pl-5 mb-10 italic">
                {post.excerpt}
              </p>

              {/* Article Content — rendered as HTML from TipTap */}
              <div
                className="prose prose-slate max-w-none prose-headings:font-serif prose-a:text-[#D80408] prose-img:rounded-xl"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-slate-100">
                  <span className="text-sm font-medium text-[#64748B]">Tags:</span>
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-slate-100 text-[#64748B] px-3 py-1.5 rounded-full hover:bg-cyan-50 hover:text-[#D80408] transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Social Share Bar */}
              <div className="flex flex-wrap items-center gap-3 mt-8 pt-8 border-t border-slate-100">
                <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5 mr-1">
                  <Share2 size={14} className="text-[#D80408]" /> Share Article:
                </span>

                {/* X / Twitter */}
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-[#64748B] hover:bg-[#0F172A] hover:text-white transition-all shadow-2xs"
                  title="Share on X (Twitter)"
                  aria-label="Share on X"
                >
                  <TwitterIcon />
                </a>

                {/* LinkedIn */}
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-[#64748B] hover:bg-[#0077B5] hover:text-white transition-all shadow-2xs"
                  title="Share on LinkedIn"
                  aria-label="Share on LinkedIn"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
                </a>

                {/* Facebook */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-[#64748B] hover:bg-[#1877F2] hover:text-white transition-all shadow-2xs"
                  title="Share on Facebook"
                  aria-label="Share on Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>

                {/* WhatsApp */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${post.title} — ${window.location.href}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-[#64748B] hover:bg-[#25D366] hover:text-white transition-all shadow-2xs"
                  title="Share on WhatsApp"
                  aria-label="Share on WhatsApp"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
                </a>

                {/* Copy Link Button */}
                <button
                  onClick={copyLink}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs border ${
                    copiedLink
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      : 'bg-slate-100 text-[#64748B] hover:bg-[#D80408] hover:text-white border-transparent'
                  }`}
                  title="Copy link to clipboard"
                  aria-label="Copy link"
                >
                  {copiedLink ? <Check size={14} /> : <Link2 size={14} />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Comments Section */}
          <section className="max-w-3xl mx-auto mb-16">
            <h2 className="font-serif text-2xl font-bold text-[#0F172A] mb-8 flex items-center gap-2">
              <MessageSquare size={22} className="text-[#D80408]" />
              {comments.length > 0 ? `${comments.length} Comment${comments.length !== 1 ? 's' : ''}` : 'Comments'}
            </h2>

            {/* Comments List */}
            {comments.length > 0 && (
              <div className="space-y-6 mb-10">
                {comments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D80408] to-[#0369A1] flex items-center justify-center text-white font-bold text-sm">
                        {comment.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0F172A]">{comment.name}</p>
                        <p className="text-xs text-[#94A3B8]">
                          {new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <p className="text-[#374151] leading-relaxed text-sm">{comment.comment}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Comment Form */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-[#0F172A] mb-5">Leave a Comment</h3>

              {commentSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-4 text-sm"
                >
                  ✅ Your comment has been submitted and is awaiting moderation. Thank you!
                </motion.div>
              ) : (
                <form onSubmit={handleSubmitComment} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Name *</label>
                      <input
                        type="text"
                        required
                        value={commentName}
                        onChange={(e) => setCommentName(e.target.value)}
                        placeholder="Your name"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#D80408] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Email *</label>
                      <input
                        type="email"
                        required
                        value={commentEmail}
                        onChange={(e) => setCommentEmail(e.target.value)}
                        placeholder="your@email.com (private)"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#D80408] transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Comment *</label>
                    <textarea
                      required
                      rows={4}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Share your thoughts on this article..."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#D80408] transition resize-none leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#94A3B8]">Your email won't be published. Comments are moderated.</p>
                    <button
                      type="submit"
                      disabled={commentSubmitting}
                      className="inline-flex items-center gap-2 bg-[#D80408] hover:bg-[#0e7490] disabled:opacity-60 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
                    >
                      {commentSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                      {commentSubmitting ? 'Submitting...' : 'Post Comment'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section aria-label="Related articles" className="mb-20">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-serif text-2xl font-bold text-[#0F172A]">
                  Related Articles
                </h2>
                <Link
                  to="/"
                  className="text-sm font-medium text-[#D80408] hover:text-[#F97316] transition-colors"
                >
                  View All →
                </Link>
              </div>
              <div className="flex flex-col gap-6">
                {relatedPosts.map((relPost, i) => (
                  <BlogCard key={relPost.id} post={relPost} index={i} />
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
