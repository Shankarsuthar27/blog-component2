import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import type { Agent } from '../../../types/agent';
import { supabase } from '../../../lib/supabase/client';
import {
  FileText,
  Trash2,
  Eye,
  Plus,
  X,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';

export const AgentMyNewsPage: React.FC = () => {
  const { agent } = useOutletContext<{ agent: Agent }>();
  const navigate = useNavigate();

  const cacheKey = `agent_articles_${agent.user_id}`;

  const [articles, setArticles] = useState<any[]>(() => {
    try {
      const cached = sessionStorage.getItem(cacheKey);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(articles.length === 0);
  const [viewingRejection, setViewingRejection] = useState<any | null>(null);

  const fetchArticles = async () => {
    try {
      const { data } = await supabase
        .from('news_articles')
        .select('*')
        .or(`author_id.eq.${agent.user_id},author.eq.${agent.full_name}`)
        .order('created_at', { ascending: false });

      const items = data || [];
      setArticles(items);
      sessionStorage.setItem(cacheKey, JSON.stringify(items));
    } catch (err) {
      console.error('Failed to load articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [agent]);

  const handleDeleteDraft = async (articleId: string) => {
    if (!window.confirm('Are you sure you want to delete this draft?')) return;
    try {
      const { error } = await supabase.from('news_articles').delete().eq('id', articleId);
      if (error) throw error;
      toast.success('Draft deleted.');
      fetchArticles();
    } catch (err: any) {
      toast.error(`Delete failed: ${err.message}`);
    }
  };

  const filteredArticles = articles.filter((item) => {
    if (activeTab === 'draft' && item.status !== 'draft') return false;
    if (activeTab === 'pending' && item.status !== 'pending') return false;
    if (activeTab === 'published' && item.status !== 'published') return false;
    if (activeTab === 'rejected' && item.status !== 'rejected') return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">My News & Articles</h1>
          <p className="text-xs text-slate-500">Manage your reported stories, drafts, and submissions.</p>
        </div>

        <button
          onClick={() => navigate('/agent/news/create')}
          className="px-5 py-2.5 rounded-xl bg-[#0891B2] text-white text-xs font-bold flex items-center gap-2 hover:bg-[#0891B2]/90 transition cursor-pointer"
        >
          <Plus size={16} /> Create New Story
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-100 dark:border-slate-800">
          {[
            { id: 'all', label: 'All Stories' },
            { id: 'published', label: 'Published' },
            { id: 'pending', label: 'Pending Review' },
            { id: 'draft', label: 'Drafts' },
            { id: 'rejected', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#0891B2] to-[#0EA5E9] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search your articles by title or category..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <p className="text-xs text-slate-400 text-center py-12">Loading articles…</p>
      ) : filteredArticles.length === 0 ? (
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <FileText size={40} className="text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No articles found matching criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredArticles.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase bg-cyan-50 dark:bg-cyan-950/40 text-[#0891B2]">
                    {item.category || 'Jalore'}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                    item.status === 'published' ? 'bg-emerald-100 text-emerald-700' : item.status === 'pending' ? 'bg-amber-100 text-amber-700' : item.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {item.excerpt || item.summary || 'No excerpt provided.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Eye size={13} /> {item.views || 0} views
                </span>

                <div className="flex items-center gap-2">
                  {item.status === 'rejected' && (
                    <button
                      onClick={() => setViewingRejection(item)}
                      className="px-2.5 py-1 bg-rose-50 text-rose-600 font-bold rounded-lg text-[11px] hover:bg-rose-100 cursor-pointer"
                    >
                      Why Rejected?
                    </button>
                  )}

                  {item.status === 'draft' && (
                    <button
                      onClick={() => handleDeleteDraft(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="Delete Draft"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Reason Modal */}
      <AnimatePresence>
        {viewingRejection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white dark:bg-[#1E293B] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center">
                <h3 className="font-serif text-lg font-bold text-rose-600">Rejection Feedback</h3>
                <button onClick={() => setViewingRejection(null)}><X size={18} className="text-slate-400" /></button>
              </div>
              <p className="text-xs text-slate-500 font-bold">{viewingRejection.title}</p>
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800">
                <p className="font-semibold">{viewingRejection.rejection_reason || 'Article requires additional verification or formatting adjustments before approval.'}</p>
              </div>
              <button onClick={() => setViewingRejection(null)} className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer">Close</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default AgentMyNewsPage;
