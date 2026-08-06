import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { supabase } from '../lib/supabase/client';
import { FolderTree, Tag, ArrowRight, Loader2, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  postCount?: number;
}

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });

    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const { data: cats } = await supabase
          .from('categories')
          .select('id, name, slug, description, color');

        const { data: blogs } = await supabase
          .from('blogs')
          .select('category_id')
          .eq('status', 'published');

        const counts: Record<string, number> = {};
        (blogs || []).forEach((b) => {
          if (b.category_id) {
            counts[b.category_id] = (counts[b.category_id] || 0) + 1;
          }
        });

        const formatted = (cats || []).map((c) => ({
          ...c,
          postCount: counts[c.id] || 0,
        }));

        setCategories(formatted);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header />

      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16 space-y-4"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ECFEFF] text-[#D80408] border border-[#CFFAFE]">
              <FolderTree size={12} /> Topic Categories
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#0F172A] leading-tight">
              Explore Content by Category
            </h1>
            <p className="text-base md:text-lg text-[#64748B] leading-relaxed">
              Browse structured technical guides, design systems, and software engineering articles grouped by core topics.
            </p>
          </motion.div>

          {/* Loader */}
          {isLoading && (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="animate-spin text-[#D80408]" size={36} />
            </div>
          )}

          {/* Categories Grid */}
          {!isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((cat, idx) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  whileHover={{ y: -6 }}
                  className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs flex flex-col justify-between group hover:border-[#D80408]/40 transition-all duration-300"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm"
                        style={{ backgroundColor: cat.color || '#D80408' }}
                      >
                        <Tag size={18} />
                      </span>
                      <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-[#64748B] rounded-full border border-slate-200 font-mono">
                        {cat.postCount} {cat.postCount === 1 ? 'Article' : 'Articles'}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif text-2xl font-bold text-[#0F172A] group-hover:text-[#D80408] transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-[#64748B] mt-2 leading-relaxed line-clamp-3">
                        {cat.description || `In-depth tutorials, guides, and practical architectural patterns about ${cat.name}.`}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100">
                    <Link
                      to={`/?search=${encodeURIComponent(cat.name)}`}
                      className="inline-flex items-center gap-2 text-xs font-bold text-[#D80408] group-hover:gap-3 transition-all"
                    >
                      View Category Posts <ArrowRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
};
export default CategoriesPage;
