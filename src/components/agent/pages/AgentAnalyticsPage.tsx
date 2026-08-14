import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Agent } from '../../../types/agent';
import { supabase } from '../../../lib/supabase/client';
import { TrendingUp, Eye, FileText } from 'lucide-react';

export const AgentAnalyticsPage: React.FC = () => {
  const { agent } = useOutletContext<{ agent: Agent }>();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from('news_articles')
          .select('*')
          .or(`author_id.eq.${agent.user_id},author.eq.${agent.full_name}`)
          .order('views', { ascending: false });

        setArticles(data || []);
      } catch (err) {
        console.error('Analytics load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [agent]);

  const totalViews = articles.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const publishedCount = articles.filter((a) => a.status === 'published').length;
  const avgViewsPerArticle = publishedCount > 0 ? Math.round(totalViews / publishedCount) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">Article Performance Analytics</h1>
        <p className="text-xs text-slate-500">Track readership, views, and top performing local stories.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#0891B2]">
            <span className="text-xs font-bold">Total Story Views</span>
            <Eye size={20} />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalViews.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400 block">Across all published articles</span>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-bold">Published Stories</span>
            <FileText size={20} />
          </div>
          <p className="text-3xl font-bold text-emerald-600">{publishedCount}</p>
          <span className="text-[10px] text-slate-400 block">Live content on website</span>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-purple-600">
            <span className="text-xs font-bold">Avg. Views / Article</span>
            <TrendingUp size={20} />
          </div>
          <p className="text-3xl font-bold text-purple-600">{avgViewsPerArticle.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400 block">Readership density ratio</span>
        </div>
      </div>

      {/* Top Performing Stories */}
      <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="font-serif font-bold text-slate-900 dark:text-white text-base">Top Performing Local Stories</h3>
        {loading ? (
          <p className="text-xs text-slate-400 text-center py-6">Loading performance metrics…</p>
        ) : articles.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No published story performance data yet.</p>
        ) : (
          <div className="space-y-3">
            {articles.slice(0, 5).map((item, idx) => (
              <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="w-7 h-7 rounded-xl bg-[#0891B2]/10 text-[#0891B2] font-bold text-xs flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.title}</h4>
                    <p className="text-[10px] text-slate-400">{item.category || 'Jalore'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 font-mono font-bold text-xs text-[#0891B2]">
                  <Eye size={14} /> {item.views || 0}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default AgentAnalyticsPage;
