import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { FeaturedPost } from '../components/blog/FeaturedPost';
import { BlogList } from '../components/blog/BlogList';
import { Pagination } from '../components/blog/Pagination';
import { SearchWidget } from '../components/sidebar/SearchWidget';
import { CategoriesWidget } from '../components/sidebar/CategoriesWidget';
import { RecentPostsWidget } from '../components/sidebar/RecentPostsWidget';
import { PopularPostsWidget } from '../components/sidebar/PopularPostsWidget';
import { NewsletterWidget } from '../components/sidebar/NewsletterWidget';
import { SocialWidget } from '../components/sidebar/SocialWidget';
import { motion } from 'framer-motion';
import { Rss } from 'lucide-react';
import { supabase } from '../lib/supabase/client';
import type { BlogPost } from '../types/blog';

const POSTS_PER_PAGE = 3;

// Transform Supabase blog row → BlogPost type for UI components
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

export const BlogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Fetch categories once
  useEffect(() => {
    supabase
      .from('categories')
      .select('id, name, slug, color')
      .then(({ data }) => setCategories(data || []));
  }, []);

  // Fetch published blogs
  useEffect(() => {
    setIsLoading(true);
    const fetchBlogs = async () => {
      let query = supabase
        .from('blogs')
        .select(`
          id, title, slug, excerpt, content, featured_image, category_id,
          reading_time, views, featured, published_at, created_at,
          profiles:author_id (full_name, avatar)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching blogs:', error);
        setBlogs([]);
      } else {
        const transformed = (data || []).map((row: any) => {
          const profile = row.profiles;
          return transformBlog({
            ...row,
            author_name: profile?.full_name,
            author_avatar: profile?.avatar,
          }, categories);
        });
        setBlogs(transformed);
      }
      setIsLoading(false);
    };

    if (categories.length >= 0) { // Run once categories is loaded (even empty)
      fetchBlogs();
    }
  }, [categories]);

  // Sync URL params
  useEffect(() => {
    const params: Record<string, string> = {};
    if (searchTerm) params.search = searchTerm;
    if (selectedCategory) params.category = selectedCategory;
    setSearchParams(params, { replace: true });
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const featuredPost = blogs.find((p) => p.featured) || blogs[0];
  const nonFeaturedPosts = blogs.filter((p) => !p.featured);

  // Filter posts client-side after fetch
  const filteredPosts = useMemo(() => {
    return nonFeaturedPosts.filter((post) => {
      const matchesSearch =
        !searchTerm ||
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        !selectedCategory || post.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, nonFeaturedPosts]);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSearchTerm('');
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setSelectedCategory('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#111827]">
      <Header />

      <main className="flex-grow max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">

        {/* Page Hero Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-cyan-50 border border-cyan-200 text-[#0891B2] text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Rss size={12} />
            Latest Articles & Insights
          </div>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-[#0F172A] mb-3">
            Explore the <span className="text-[#0891B2]">Daily Bharat</span>
          </h1>
          <p className="text-[#64748B] text-base md:text-lg max-w-2xl mx-auto">
            Thoughtful articles on web development, design, technology, and the ideas shaping the modern web.
          </p>
        </motion.div>

        {/* Featured Post */}
        {featuredPost && (
          <section aria-label="Featured post" className="mb-14">
            <FeaturedPost post={featuredPost} />
          </section>
        )}

        {/* Active filters indicator */}
        {(searchTerm || selectedCategory) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 flex items-center gap-3 flex-wrap"
          >
            <span className="text-sm text-[#64748B]">Filtering by:</span>
            {searchTerm && (
              <span className="inline-flex items-center gap-1.5 bg-cyan-50 border border-cyan-200 text-[#0891B2] text-xs font-semibold px-3 py-1.5 rounded-full">
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="hover:text-red-500 transition-colors ml-0.5 font-bold"
                  aria-label="Clear search"
                >×</button>
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center gap-1.5 bg-cyan-50 border border-cyan-200 text-[#0891B2] text-xs font-semibold px-3 py-1.5 rounded-full">
                Category: {selectedCategory}
                <button
                  onClick={() => setSelectedCategory('')}
                  className="hover:text-red-500 transition-colors ml-0.5 font-bold"
                  aria-label="Clear category filter"
                >×</button>
              </span>
            )}
          </motion.div>
        )}

        {/* Two-column grid: Posts + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Main post list (70%) */}
          <section aria-label="Blog posts" className="lg:col-span-8">
            <BlogList
              posts={paginatedPosts}
              isLoading={isLoading}
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => {
                setCurrentPage(p);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </section>

          {/* Sidebar (30%) */}
          <aside aria-label="Blog sidebar" className="lg:col-span-4">
            <div className="sticky top-[88px] space-y-6">
              <SearchWidget value={searchTerm} onChange={handleSearchChange} />
              <CategoriesWidget
                selectedCategory={selectedCategory}
                onSelect={handleCategorySelect}
              />
              <NewsletterWidget />
              <RecentPostsWidget posts={blogs} />
              <PopularPostsWidget posts={blogs} />
              <SocialWidget />
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};
