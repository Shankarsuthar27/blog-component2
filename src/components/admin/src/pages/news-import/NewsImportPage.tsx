import React, { useState, useEffect, useMemo } from 'react';
import {
  RefreshCw,
  Search,
  Filter,
  Newspaper,
  Clock,
  CheckCircle,
  XCircle,
  FileCheck,
  AlertCircle,
  History,
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../../../../lib/supabase/client';
import type { NewsArticle, NewsImportLog, NewsStatus } from '../../../../../types/news';
import { NewsCard } from './components/NewsCard';
import { NewsEditorModal } from './components/NewsEditorModal';
import { ImportLogsModal } from './components/ImportLogsModal';

export const NewsImportPage: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [logs, setLogs] = useState<NewsImportLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Filters & Search
  const [activeTab, setActiveTab] = useState<string>('pending'); // 'all' | 'pending' | 'approved' | 'published' | 'rejected'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modals
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [showLogsModal, setShowLogsModal] = useState(false);

  // Statistics
  const stats = useMemo(() => {
    const totalFetched = articles.length;
    const pending = articles.filter((a) => a.status === 'pending').length;
    const approved = articles.filter((a) => a.status === 'approved').length;
    const published = articles.filter((a) => a.status === 'published').length;
    const rejected = articles.filter((a) => a.status === 'rejected').length;
    const lastSyncTime = articles[0]?.imported_at || logs[0]?.created_at || null;

    return { totalFetched, pending, approved, published, rejected, lastSyncTime };
  }, [articles, logs]);

  const [tableMissing, setTableMissing] = useState(false);

  // Fetch articles and logs from Supabase
  const fetchArticles = async () => {
    setIsLoading(true);
    setTableMissing(false);
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P01' || error.message?.includes('news_articles') || error.message?.includes('cache')) {
          setTableMissing(true);
        }
        throw error;
      }
      setArticles((data as NewsArticle[]) || []);

      // Fetch latest logs
      const { data: logsData } = await supabase
        .from('news_import_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      setLogs((logsData as NewsImportLog[]) || []);
    } catch (err: any) {
      console.error('Failed to fetch news articles:', err);
      if (err?.code === '42P01' || err?.message?.includes('news_articles')) {
        setTableMissing(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const [serverOffline, setServerOffline] = useState(false);

  // Trigger News Sync
  const handleManualSync = async () => {
    setIsSyncing(true);
    setServerOffline(false);
    const toastId = toast.loading('Syncing latest Jalore news from Dainik Bhaskar & sources...');
    try {
      // Call backend news-fetcher endpoint via Vite proxy or direct port
      const response = await fetch('/api/news/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || 'News import completed!', { id: toastId });
      } else {
        if (response.status === 502 || response.status === 504 || response.status === 400) {
          setServerOffline(true);
          toast.error('News fetcher server is offline (502 Bad Gateway). Run "npm run news-fetcher" in terminal.', { id: toastId, duration: 6000 });
        } else {
          const errText = await response.text();
          toast.error(`Backend sync returned error: ${response.statusText || errText}`, { id: toastId });
        }
      }

      await fetchArticles();
    } catch (err: any) {
      console.warn('Backend news-fetcher server is offline:', err);
      setServerOffline(true);
      toast.error('News fetcher server is offline. Run "npm run news-fetcher" in your terminal.', { id: toastId, duration: 6000 });
    } finally {
      setIsSyncing(false);
    }
  };

  // Status Change Actions (Approve / Reject / Publish)
  const handleUpdateStatus = async (id: string, targetStatus: NewsStatus) => {
    try {
      const updatePayload: Partial<NewsArticle> = {
        status: targetStatus,
        ...(targetStatus === 'published' || targetStatus === 'approved' ? { published_at: new Date().toISOString() } : {}),
      };

      const { error } = await supabase
        .from('news_articles')
        .update(updatePayload)
        .eq('id', id);

      if (error) throw error;

      toast.success(`Article marked as ${targetStatus}`);
      setArticles((prev) =>
        prev.map((art) => (art.id === id ? { ...art, ...updatePayload } : art))
      );
    } catch (err: any) {
      console.error('Failed to update article status:', err);
      toast.error('Failed to update status');
    }
  };

  // Save changes from Editor modal
  const handleSaveArticle = async (updatedArticle: Partial<NewsArticle>, targetStatus?: NewsStatus) => {
    try {
      const { error } = await supabase
        .from('news_articles')
        .update({
          ...updatedArticle,
          updated_at: new Date().toISOString(),
        })
        .eq('id', updatedArticle.id);

      if (error) throw error;

      toast.success(`Article updated ${targetStatus ? `and set to ${targetStatus}` : ''}`);
      setArticles((prev) =>
        prev.map((art) => (art.id === updatedArticle.id ? { ...art, ...updatedArticle } : art))
      );
    } catch (err: any) {
      console.error('Failed to save article:', err);
      toast.error('Failed to save article updates');
    }
  };

  // Filtered Articles list
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      // Tab filter
      if (activeTab !== 'all' && art.status !== activeTab) return false;

      // Source filter
      if (selectedSource !== 'all' && art.source_name !== selectedSource) return false;

      // Category filter
      if (selectedCategory !== 'all' && art.category !== selectedCategory) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = art.title.toLowerCase().includes(q);
        const matchesSummary = (art.summary || '').toLowerCase().includes(q);
        const matchesExcerpt = (art.excerpt || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesSummary && !matchesExcerpt) return false;
      }

      return true;
    });
  }, [articles, activeTab, selectedSource, selectedCategory, searchQuery]);

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header & Main Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Newspaper className="text-[#0891B2]" size={28} />
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              Automated News Import
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Discover, ingest, review, edit, and publish Jalore local news from Dainik Bhaskar & RSS feeds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLogsModal(true)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
          >
            <History size={16} />
            Import Logs
          </button>

          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0891B2] to-[#0EA5E9] text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-[#0891B2]/20 hover:opacity-95 disabled:opacity-60 transition cursor-pointer"
          >
            <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'Syncing News...' : '↻ Sync Latest News'}</span>
          </button>
        </div>
      </div>

      {tableMissing && (
        <div className="p-5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={22} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Supabase `news_articles` Table Setup Required
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                The database tables have not been created in Supabase yet. Please execute the SQL migration script located at <code className="font-mono bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded">supabase/news_schema.sql</code> in your Supabase SQL Editor.
              </p>
            </div>
          </div>
          <button
            onClick={async () => {
              const sqlRes = await fetch('/supabase/news_schema.sql');
              const sqlText = await sqlRes.text();
              navigator.clipboard.writeText(sqlText);
              toast.success('`news_schema.sql` copied to clipboard! Paste it into Supabase SQL Editor.');
            }}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-xs transition shrink-0 cursor-pointer"
          >
            Copy SQL Script
          </button>
        </div>
      )}

      {serverOffline && (
        <div className="p-5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={22} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                News Fetcher Service Offline
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-400 mt-0.5">
                The backend news ingestion service is not running. In your terminal, run <code className="font-mono bg-rose-100 dark:bg-rose-900/60 px-1.5 py-0.5 rounded">npm run news-fetcher</code> to start the service and enable background & manual sync.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText('npm run news-fetcher');
              toast.success('Command "npm run news-fetcher" copied to clipboard!');
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs transition shrink-0 cursor-pointer"
          >
            Copy Command
          </button>
        </div>
      )}

      {/* Metric Cards Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Fetched */}
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Fetched</span>
            <Layers size={18} className="text-[#0891B2]" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalFetched}</div>
          <p className="text-[10px] text-slate-400 mt-1">In Supabase DB</p>
        </div>

        {/* Pending */}
        <div className="bg-white dark:bg-[#1E293B] border border-[#0891B2]/30 p-4 rounded-2xl shadow-xs bg-cyan-50/20">
          <div className="flex items-center justify-between text-amber-500 mb-2">
            <span className="text-xs font-semibold">Pending Review</span>
            <Clock size={18} />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</div>
          <p className="text-[10px] text-slate-400 mt-1">Awaiting action</p>
        </div>

        {/* Approved */}
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-emerald-500 mb-2">
            <span className="text-xs font-semibold">Approved</span>
            <CheckCircle size={18} />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.approved}</div>
          <p className="text-[10px] text-slate-400 mt-1">Ready to publish</p>
        </div>

        {/* Published */}
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-[#0891B2] mb-2">
            <span className="text-xs font-semibold">Published</span>
            <FileCheck size={18} />
          </div>
          <div className="text-2xl font-bold text-[#0891B2] dark:text-cyan-400">{stats.published}</div>
          <p className="text-[10px] text-slate-400 mt-1">Live on website</p>
        </div>

        {/* Rejected */}
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-rose-500 mb-2">
            <span className="text-xs font-semibold">Rejected</span>
            <XCircle size={18} />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{stats.rejected}</div>
          <p className="text-[10px] text-slate-400 mt-1">Discarded items</p>
        </div>

        {/* Last Sync */}
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Last Sync</span>
            <RefreshCw size={18} className="text-[#0891B2]" />
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
            {stats.lastSyncTime
              ? new Date(stats.lastSyncTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
              : 'Never'}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Automated job active</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-100 dark:border-slate-800">
          {[
            { id: 'pending', label: `Pending (${stats.pending})` },
            { id: 'all', label: `All (${stats.totalFetched})` },
            { id: 'approved', label: `Approved (${stats.approved})` },
            { id: 'published', label: `Published (${stats.published})` },
            { id: 'rejected', label: `Rejected (${stats.rejected})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#0891B2] to-[#0EA5E9] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Dropdown Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search imported news titles or excerpts..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0891B2]"
            />
          </div>

          {/* Source Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={14} className="text-slate-400 shrink-0" />
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#0891B2] w-full sm:w-auto"
            >
              <option value="all">All Sources</option>
              <option value="Dainik Bhaskar">Dainik Bhaskar</option>
              <option value="Patrika">Patrika</option>
              <option value="Amar Ujala">Amar Ujala</option>
            </select>

            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#0891B2] w-full sm:w-auto"
            >
              <option value="all">All Categories</option>
              <option value="Jalore">Jalore</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Crime">Crime</option>
              <option value="Politics">Politics</option>
              <option value="Education">Education</option>
              <option value="Weather">Weather</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Articles */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-80 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <AlertCircle size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            No News Articles Found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
            There are no articles matching the selected tab or search filters.
          </p>
          <button
            onClick={handleManualSync}
            className="px-5 py-2.5 rounded-xl bg-[#0891B2] text-white text-xs font-semibold shadow-sm hover:bg-cyan-700 transition"
          >
            ↻ Sync Latest News
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <NewsCard
              key={article.id}
              article={article}
              onEdit={(art) => setEditingArticle(art)}
              onApprove={(id) => handleUpdateStatus(id, 'approved')}
              onReject={(id) => handleUpdateStatus(id, 'rejected')}
              onPublish={(id) => handleUpdateStatus(id, 'published')}
            />
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {editingArticle && (
        <NewsEditorModal
          article={editingArticle}
          onClose={() => setEditingArticle(null)}
          onSave={handleSaveArticle}
        />
      )}

      {/* Logs Modal */}
      {showLogsModal && (
        <ImportLogsModal
          logs={logs}
          onClose={() => setShowLogsModal(false)}
          onRefresh={fetchArticles}
        />
      )}
    </div>
  );
};
