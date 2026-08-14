import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { NewsCard } from '../components/blog/NewsCard';
import { Pagination } from '../components/blog/Pagination';
import { SearchWidget } from '../components/sidebar/SearchWidget';
import { Newspaper, Loader2, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase/client';
import type { NewsArticle } from '../types/news';

const ITEMS_PER_PAGE = 6;

const CATEGORIES = [
  'All',
  'Jalore',
  'Rajasthan',
  'Crime',
  'Politics',
  'Education',
  'Weather',
  'Business',
  'Sports',
  'Local',
];

export const NewsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [articles, setArticles] = useState<NewsArticle[]>([]);

  useEffect(() => {
    const fetchPublishedNews = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('news_articles')
          .select('*')
          .eq('status', 'published')
          .order('source_published_at', { ascending: false });

        if (error) throw error;
        setArticles((data as NewsArticle[]) || []);
      } catch (err) {
        console.error('Failed to fetch public news:', err);
        setArticles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublishedNews();
  }, []);

  // Sync URL params
  useEffect(() => {
    const params: Record<string, string> = {};
    if (searchTerm) params.search = searchTerm;
    if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
    setSearchParams(params, { replace: true });
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchesSearch =
        !searchTerm ||
        art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (art.summary || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (art.excerpt || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' || art.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [articles, searchTerm, selectedCategory]);

  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#111827]">
      <Header />

      <main className="flex-grow max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* Intro Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-[#D80408]/10 border border-[#D80408]/20 px-3.5 py-1.5 rounded-full text-[#D80408] text-xs font-bold uppercase tracking-wider mb-4">
            <MapPin size={14} /> Jalore Local News Pipeline
          </div>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-[#0F172A] mb-3">
            जालोर की ताज़ा ख़बरें (Daily Jalore News)
          </h1>
          <p className="text-[#64748B] text-base md:text-lg max-w-2xl mx-auto">
            Automated, curated local news from Dainik Bhaskar & verified sources across Jalore, Rajasthan.
          </p>
        </motion.div>

        {/* Dynamic Category Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none justify-start md:justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-[#D80408] text-white border-[#D80408] shadow-md shadow-[#D80408]/20'
                  : 'bg-white text-[#64748B] border-slate-200 hover:border-[#D80408] hover:text-[#D80408]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Two Column Grid: Articles + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Articles Feed */}
          <section className="lg:col-span-8">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin text-[#D80408] mb-3" size={36} />
                <p className="text-sm text-[#64748B]">Loading latest Jalore news feed...</p>
              </div>
            ) : paginatedArticles.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                <Newspaper size={44} className="mx-auto text-slate-300 mb-3" />
                <h3 className="font-serif text-xl font-bold text-[#0F172A] mb-2">No Published News Yet</h3>
                <p className="text-sm text-[#64748B] max-w-md mx-auto">
                  There are no published news articles matching your current filter. Check back soon as new stories are imported regularly.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {paginatedArticles.map((article) => (
                    <NewsCard key={article.id} article={article} />
                  ))}
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(p) => {
                    setCurrentPage(p);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            )}
          </section>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-[88px] space-y-6">
              <SearchWidget value={searchTerm} onChange={setSearchTerm} />

              {/* Attribution Notice Card */}
              <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white p-6 rounded-2xl shadow-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Newspaper className="text-[#0891B2]" size={20} />
                  <h3 className="font-serif font-bold text-lg">Daily Bharat News Aggregator</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Our system automatically discovers permitted local Jalore news feeds from Dainik Bhaskar and credited news outlets. All articles maintain direct source attribution.
                </p>
                <div className="text-[11px] text-[#0891B2] font-semibold flex items-center gap-1.5 bg-[#0891B2]/10 border border-[#0891B2]/20 px-3 py-2 rounded-xl">
                  ✓ Verified Source Attribution Enabled
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};
