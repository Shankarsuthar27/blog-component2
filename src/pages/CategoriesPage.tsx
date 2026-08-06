import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { supabase } from '../lib/supabase/client';
import { BlogCard } from '../components/blog/BlogCard';
import type { BlogPost } from '../types/blog';
import { FolderTree, Tag as TagIcon, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  count?: number;
}

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategoriesAndPosts();
  }, []);

  const fetchCategoriesAndPosts = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch categories
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      const categoryList = catData || [];

      // 2. Fetch published blogs
      const { data: blogData } = await supabase
        .from('blogs')
        .select(`
          id, title, slug, excerpt, content, featured_image, category_id,
          reading_time, views, featured, published_at, created_at,
          profiles:author_id (full_name, avatar)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      const blogList = blogData || [];

      // Calculate post counts per category
      const categoriesWithCount = categoryList.map((cat) => ({
        ...cat,
        count: blogList.filter((b) => b.category_id === cat.id).length,
      }));

      setCategories(categoriesWithCount);

      // Transform blogs
      const transformed = blogList.map((b) => {
        const cat = categoryList.find((c) => c.id === b.category_id);
        const profile = b.profiles;
        return {
          id: b.id,
          title: b.title,
          slug: b.slug,
          excerpt: b.excerpt || '',
          content: b.content || '',
          image: b.featured_image
            ? b.featured_image.replace('/storage/v1/object/media/', '/storage/v1/object/public/media/')
            : 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=800',
          category: cat?.name || 'General',
          author: {
            name: profile?.full_name || 'Insight Journal',
            avatar: profile?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
          },
          publishedAt: b.published_at
            ? new Date(b.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          readingTime: b.reading_time || '5 min read',
          views: b.views || 0,
          featured: b.featured || false,
          tags: [],
        };
      });

      setPosts(transformed);
    } catch (e) {
      console.error('Failed to load categories page data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPosts = selectedCategory
    ? posts.filter((p) => p.category === selectedCategory)
    : posts;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header />

      <main className="flex-grow pt-28 pb-16">
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ECFEFF] text-[#0891B2] border border-[#CFFAFE]">
              <FolderTree size={13} /> Article Topics
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#0F172A] tracking-tight">
              Browse by <span className="text-[#0891B2]">Category</span>
            </h1>
            <p className="text-base text-[#64748B]">
              Filter articles by technology stacks, design architecture, cloud infrastructure, and tutorials.
            </p>
          </div>
        </section>

        {/* Category Pills & Badges */}
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="flex flex-wrap gap-3 p-4 bg-white border border-[#E2E8F0] rounded-3xl shadow-2xs">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === null
                  ? 'bg-[#0891B2] text-white shadow-md shadow-[#0891B2]/20'
                  : 'bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0]'
              }`}
            >
              All Topics ({posts.length})
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-[#0891B2] text-white shadow-md shadow-[#0891B2]/20'
                      : 'bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0]'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-[#64748B]'
                  }`}>
                    {cat.count || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Posts Grid */}
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="animate-spin text-[#0891B2]" size={32} />
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-12 text-center max-w-lg mx-auto space-y-3">
              <TagIcon size={32} className="text-[#64748B] mx-auto" />
              <h3 className="font-serif text-xl font-bold text-[#0F172A]">No articles found</h3>
              <p className="text-xs text-[#64748B]">There are currently no published posts under this category.</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};
export default CategoriesPage;
