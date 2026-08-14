import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, Link } from 'react-router-dom';
import type { Agent } from '../../../types/agent';
import { supabase } from '../../../lib/supabase/client';
import {
  FileText,
  CheckCircle2,
  Clock,
  FileEdit,
  XCircle,
  Eye,
  Plus,
  Share2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const AgentDashboardPage: React.FC = () => {
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

  const [stats, setStats] = useState(() => {
    let viewsSum = 0, pub = 0, pend = 0, drf = 0, rej = 0;
    articles.forEach((item) => {
      viewsSum += item.views || 0;
      if (item.status === 'published') pub++;
      else if (item.status === 'pending') pend++;
      else if (item.status === 'draft') drf++;
      else if (item.status === 'rejected') rej++;
    });
    return {
      total: articles.length,
      published: pub,
      pending: pend,
      drafts: drf,
      rejected: rej,
      totalViews: viewsSum,
    };
  });

  const [loading, setLoading] = useState(articles.length === 0);

  useEffect(() => {
    let isMounted = true;
    const fetchAgentArticles = async () => {
      try {
        const { data } = await supabase
          .from('news_articles')
          .select('*')
          .or(`author_id.eq.${agent.user_id},author.eq.${agent.full_name}`)
          .order('created_at', { ascending: false });

        const items = data || [];
        if (isMounted) {
          setArticles(items);
          sessionStorage.setItem(cacheKey, JSON.stringify(items));

          let viewsSum = 0, pub = 0, pend = 0, drf = 0, rej = 0;
          items.forEach((item) => {
            viewsSum += item.views || 0;
            if (item.status === 'published') pub++;
            else if (item.status === 'pending') pend++;
            else if (item.status === 'draft') drf++;
            else if (item.status === 'rejected') rej++;
          });

          setStats({
            total: items.length,
            published: pub,
            pending: pend,
            drafts: drf,
            rejected: rej,
            totalViews: viewsSum,
          });
        }
      } catch (err) {
        console.error('Failed to load agent articles:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAgentArticles();
    return () => { isMounted = false; };
  }, [agent, cacheKey]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#0F172A] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#0891B2]/20 text-cyan-300 border border-[#0891B2]/40 uppercase tracking-wider">
            <Sparkles size={12} /> Ground Reporter Dashboard
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Welcome back, {agent.full_name.split(' ')[0]} 👋
          </h1>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Agent ID: <strong className="text-[#0891B2] font-mono">{agent.agent_id}</strong> · Reporting for <strong>{agent.city || agent.district}</strong>, {agent.state}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/agent/news/create')}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#0891B2] to-[#0EA5E9] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#0891B2]/20 hover:opacity-95 transition cursor-pointer"
          >
            <Plus size={16} /> Create New Story
          </button>
          <button
            onClick={() => navigate('/agent/referrals')}
            className="px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 hover:bg-slate-700 transition cursor-pointer"
          >
            <Share2 size={15} /> Referral Link
          </button>
        </div>
      </div>

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Articles</span>
            <FileText size={18} className="text-[#0891B2]" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
          <span className="text-[10px] text-slate-400 block">Submitted & drafts</span>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-semibold">Published</span>
            <CheckCircle2 size={18} />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.published}</p>
          <span className="text-[10px] text-slate-400 block">Live on news site</span>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-amber-200 dark:border-amber-900/50 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-semibold">Pending Review</span>
            <Clock size={18} />
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</p>
          <span className="text-[10px] text-slate-400 block">Awaiting admin review</span>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Drafts</span>
            <FileEdit size={18} />
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{stats.drafts}</p>
          <span className="text-[10px] text-slate-400 block">Unsubmitted items</span>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-rose-200 dark:border-rose-900/50 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-rose-500">
            <span className="text-xs font-semibold">Rejected</span>
            <XCircle size={18} />
          </div>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{stats.rejected}</p>
          <span className="text-[10px] text-slate-400 block">Requires revision</span>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-cyan-200 dark:border-cyan-900/50 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#0891B2]">
            <span className="text-xs font-semibold">Total Views</span>
            <Eye size={18} />
          </div>
          <p className="text-2xl font-bold text-[#0891B2] dark:text-cyan-400">{stats.totalViews.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400 block">Reader engagement</span>
        </div>
      </div>

      {/* Recent Submissions Feed */}
      <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-serif text-lg font-bold text-slate-900 dark:text-white">Recent Story Submissions</h2>
            <p className="text-xs text-slate-500">Monitor article approval status and reader counts.</p>
          </div>

          <Link to="/agent/news" className="text-xs font-bold text-[#0891B2] hover:underline flex items-center gap-1">
            View All Stories <ArrowRight size={13} />
          </Link>
        </div>

        <div className="space-y-3">
          {loading ? (
            <p className="text-xs text-slate-400 text-center py-8">Loading your stories…</p>
          ) : articles.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <FileText size={36} className="text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No articles created yet</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">Start reporting local news from your area by creating your first article draft.</p>
              <button
                onClick={() => navigate('/agent/news/create')}
                className="px-5 py-2.5 bg-[#0891B2] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                + Create First Article
              </button>
            </div>
          ) : (
            articles.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <img
                    src={item.featured_image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=200'}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover shrink-0 bg-slate-100"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate leading-snug">{item.title}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {item.category || 'Jalore'} · {new Date(item.created_at).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                    item.status === 'published' ? 'bg-emerald-100 text-emerald-700' : item.status === 'pending' ? 'bg-amber-100 text-amber-700' : item.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.status}
                  </span>

                  <span className="text-xs text-slate-500 font-mono hidden sm:inline-flex items-center gap-1">
                    <Eye size={12} /> {item.views || 0}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
export default AgentDashboardPage;
