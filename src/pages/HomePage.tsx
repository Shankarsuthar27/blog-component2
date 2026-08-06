import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { FeaturedPost } from '../components/blog/FeaturedPost';
import { BlogCard } from '../components/blog/BlogCard';
import { NewsletterWidget } from '../components/sidebar/NewsletterWidget';
import { supabase } from '../lib/supabase/client';
import type { BlogPost } from '../types/blog';
import { TrendingUp, ArrowRight, Sparkles, FolderTree, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

function transformBlog(row: any, categories: any[]): BlogPost {
  const category = categories.find((c: any) => c.id === row.category_id);
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt || '',
    content: row.content || '',
    image: row.featured_image
      ? row.featured_image.replace('/storage/v1/object/media/', '/storage/v1/object/public/media/')
      : 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=800',
    category: category?.name || 'General',
    author: {
      name: row.author_name || 'Daily Bharat',
      avatar: row.author_avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
      bio: row.author_bio || '',
    },
    publishedAt: row.published_at
      ? new Date(row.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    readingTime: row.reading_time || '5 min read',
    views: row.views || 0,
    featured: row.featured || false,
    tags: [],
  };
}

export const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: cats } = await supabase
          .from('categories')
          .select('id, name, slug, description, color');
        const loadedCategories = cats || [];
        setCategories(loadedCategories);

        const { data: blogsData } = await supabase
          .from('blogs')
          .select(`
            id, title, slug, excerpt, content, featured_image, category_id,
            reading_time, views, featured, published_at, created_at
          `)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(7);

        if (blogsData) {
          const transformed = blogsData.map((b) => transformBlog(b, loadedCategories));
          setPosts(transformed);
        }
      } catch (err) {
        console.error('Failed to load home page content:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const featuredPost = posts.find((p) => p.featured) || posts[0];
  const latestPosts = posts.filter((p) => p.id !== featuredPost?.id).slice(0, 6);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header />

      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Welcome Hero Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-12 space-y-4"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-50 text-[#D80408] border border-red-100">
              <Sparkles size={12} /> Har Khabar, Desh Ke Saath
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-[#0F172A] leading-tight">
              Aapka Desh, <span className="text-[#D80408]">Aapki Aawaz</span>
            </h1>
            <p className="text-base md:text-lg text-[#64748B] leading-relaxed">
              Stay ahead with breaking stories, technical architectures, and in-depth articles curated daily by Daily Bharat.
            </p>
          </motion.div>

          {/* Featured Breaking Story */}
          {featuredPost && (
            <div className="mb-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl font-bold text-[#0F172A] flex items-center gap-2">
                  <TrendingUp size={20} className="text-[#D80408]" /> Featured Story
                </h2>
              </div>
              <FeaturedPost post={featuredPost} />
            </div>
          )}

          {/* Categories Highlights */}
          {categories.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl font-bold text-[#0F172A] flex items-center gap-2">
                  <FolderTree size={20} className="text-[#D80408]" /> Explore Topics
                </h2>
                <Link to="/categories" className="text-xs font-bold text-[#D80408] hover:underline flex items-center gap-1">
                  All Categories <ArrowRight size={14} />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {categories.slice(0, 4).map((c) => (
                  <Link
                    key={c.id}
                    to={`/blog?search=${encodeURIComponent(c.name)}`}
                    className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-[#D80408]/40 transition-all hover:-translate-y-1 shadow-2xs group"
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs mb-3 shadow-xs"
                      style={{ backgroundColor: c.color || '#D80408' }}
                    >
                      {c.name.charAt(0)}
                    </div>
                    <h3 className="font-serif font-bold text-base text-[#0F172A] group-hover:text-[#D80408] transition">
                      {c.name}
                    </h3>
                    <p className="text-[11px] text-[#64748B] mt-1 line-clamp-1">{c.description || 'Explore articles'}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Latest Articles Grid */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-2xl font-bold text-[#0F172A] flex items-center gap-2">
                <BookOpen size={20} className="text-[#D80408]" /> Latest Published Articles
              </h2>
              <Link
                to="/blog"
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-[#D80408] text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-red-100"
              >
                View Full Blog <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </div>

          {/* Newsletter CTA */}
          <div className="max-w-2xl mx-auto">
            <NewsletterWidget />
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};
export default HomePage;
