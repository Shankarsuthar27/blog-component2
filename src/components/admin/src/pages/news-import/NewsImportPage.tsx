import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  CalendarCheck,
  Radio,
  ExternalLink,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../../../../lib/supabase/client';
import type { NewsArticle, NewsImportLog, NewsImportStats, NewsStatus } from '../../../../../types/news';
import { NewsCard } from './components/NewsCard';
import { NewsEditorModal } from './components/NewsEditorModal';
import { ImportLogsModal } from './components/ImportLogsModal';

export const NewsImportPage: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [logs, setLogs] = useState<NewsImportLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [serverStats, setServerStats] = useState<Partial<NewsImportStats>>({});

  // Filters & Search
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modals
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [tableMissing, setTableMissing] = useState(false);
  const [serverOffline, setServerOffline] = useState(false);

  // Fetch articles from Supabase
  const fetchArticles = useCallback(async () => {
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

      const { data: logsData } = await supabase
        .from('news_import_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(40);

      setLogs((logsData as NewsImportLog[]) || []);
    } catch (err: any) {
      console.error('Failed to fetch news articles:', err);
      if (err?.code === '42P01' || err?.message?.includes('news_articles')) {
        setTableMissing(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch backend server status & scheduler state
  const fetchServerStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/news/status', { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const data = await res.json();
        setServerStats(data);
        setServerOffline(false);
      } else {
        setServerOffline(true);
      }
    } catch {
      setServerOffline(true);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
    fetchServerStatus();
    const timer = setInterval(fetchServerStatus, 30000);
    return () => clearInterval(timer);
  }, [fetchArticles, fetchServerStatus]);

  const stats = useMemo(() => {
    const totalFetched = articles.length;
    const pending = articles.filter((a) => a.status === 'pending').length;
    const approved = articles.filter((a) => a.status === 'approved').length;
    const published = articles.filter((a) => a.status === 'published').length;
    const rejected = articles.filter((a) => a.status === 'rejected').length;
    const lastSyncTime = serverStats.lastSyncTime || logs[0]?.created_at || articles[0]?.imported_at || null;
    const nextSyncTime = serverStats.nextSyncTime || null;
    return { totalFetched, pending, approved, published, rejected, lastSyncTime, nextSyncTime };
  }, [articles, logs, serverStats]);

  // ── Manual Sync (requires backend news-fetcher server on :3001) ──────────────
  const handleManualSync = async () => {
    setIsSyncing(true);
    setServerOffline(false);
    const toastId = toast.loading('Syncing latest Jalore news from Dainik Bhaskar…');
    try {
      const response = await fetch('/api/news/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.imported > 0) {
          toast.success(`✅ ${result.imported} new article${result.imported > 1 ? 's' : ''} imported!`, { id: toastId, duration: 5000 });
        } else if (result.duplicates > 0 && result.imported === 0) {
          toast.success(
            `All ${result.duplicates} articles already exist. If data is wrong, use "Clear Pending & Re-sync".`,
            { id: toastId, duration: 7000 }
          );
        } else {
          toast.success(result.message || 'Sync completed.', { id: toastId, duration: 5000 });
        }
      } else {
        setServerOffline(true);
        toast.error('News-fetcher server offline. Run "npm run dev" in your terminal.', { id: toastId, duration: 7000 });
      }
      await Promise.all([fetchArticles(), fetchServerStatus()]);
    } catch {
      setServerOffline(true);
      toast.error('Cannot connect to news-fetcher server. Run "npm run dev" in terminal.', { id: toastId, duration: 7000 });
    } finally {
      setIsSyncing(false);
    }
  };

  // ── Clear All Pending & Re-sync ──────────────────────────────────────────────
  // Delete uses Supabase client directly — no backend needed for this step.
  // Sync still requires the backend (fetching is server-side only).
  const handleClearAndResync = async () => {
    if (!window.confirm(
      'DELETE all pending articles from the database, then run a fresh sync to re-import correct data?\n\nThis fixes wrong titles / bad data from previous imports.'
    )) return;

    setIsClearing(true);
    const toastId = toast.loading('Deleting old pending articles from Supabase…');
    try {
      // ── Step 1: Delete all pending articles directly via Supabase ────────────
      const { error: delError, count } = await supabase
        .from('news_articles')
        .delete({ count: 'exact' })
        .eq('status', 'pending');

      if (delError) throw delError;

      toast.loading(`Cleared ${count ?? 0} pending articles. Starting fresh sync…`, { id: toastId });
      setIsClearing(false);

      // Refresh the list so deleted articles disappear immediately
      setArticles((prev) => prev.filter((a) => a.status !== 'pending'));

      // ── Step 2: Run sync via backend ─────────────────────────────────────────
      setIsSyncing(true);
      const syncRes = await fetch('/api/news/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (syncRes.ok) {
        const result = await syncRes.json();
        toast.success(
          result.imported > 0
            ? `✅ ${result.imported} fresh articles imported successfully!`
            : result.message || 'Sync completed.',
          { id: toastId, duration: 6000 }
        );
      } else {
        setServerOffline(true);
        toast.error(
          'Articles cleared ✅ — but sync failed (backend offline). Run "npm run dev", then click "Sync Latest News Now".',
          { id: toastId, duration: 8000 }
        );
      }

      await Promise.all([fetchArticles(), fetchServerStatus()]);
    } catch (err: any) {
      toast.error(`Failed: ${err.message}`, { id: toastId });
    } finally {
      setIsClearing(false);
      setIsSyncing(false);
    }
  };

  // ── Delete a single article (Supabase directly — no backend needed) ──────────
  const handleDeleteArticle = async (id: string) => {
    try {
      const { error } = await supabase.from('news_articles').delete().eq('id', id);
      if (error) throw error;
      toast.success('Article deleted.');
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      toast.error(`Failed to delete: ${err.message}`);
    }
  };

  // ── Status Change Actions ────────────────────────────────────────────────────
  const handleUpdateStatus = async (id: string, targetStatus: NewsStatus) => {
    try {
      const updatePayload: Partial<NewsArticle> = {
        status: targetStatus,
        ...(targetStatus === 'published' ? { published_at: new Date().toISOString() } : {}),
      };
      const { error } = await supabase.from('news_articles').update(updatePayload).eq('id', id);
      if (error) throw error;
      toast.success(`Article marked as ${targetStatus}`);
      setArticles((prev) => prev.map((art) => (art.id === id ? { ...art, ...updatePayload } : art)));
    } catch (err: any) {
      toast.error('Failed to update status');
    }
  };

  // ── Save from Editor ─────────────────────────────────────────────────────────
  const handleSaveArticle = async (updatedArticle: Partial<NewsArticle>, targetStatus?: NewsStatus) => {
    try {
      const payload = {
        ...updatedArticle,
        ...(targetStatus ? { status: targetStatus } : {}),
        ...(targetStatus === 'published' ? { published_at: new Date().toISOString() } : {}),
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from('news_articles').update(payload).eq('id', updatedArticle.id);
      if (error) throw error;
      toast.success(`Article saved${targetStatus ? ` and marked as ${targetStatus}` : ''}`);
      setArticles((prev) => prev.map((art) => (art.id === updatedArticle.id ? { ...art, ...payload } : art)));
    } catch (err: any) {
      toast.error('Failed to save article');
    }
  };

  // ── Filtered articles ────────────────────────────────────────────────────────
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      if (activeTab !== 'all' && art.status !== activeTab) return false;
      if (selectedSource !== 'all' && art.source_name !== selectedSource) return false;
      if (selectedCategory !== 'all' && art.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !art.title.toLowerCase().includes(q) &&
          !(art.summary || '').toLowerCase().includes(q) &&
          !(art.excerpt || '').toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [articles, activeTab, selectedSource, selectedCategory, searchQuery]);

  const formatTime = (isoString?: string | null) => {
    if (!isoString) return 'Not yet run';
    return new Date(isoString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const isBusy = isSyncing || isClearing || (serverStats.isSyncing ?? false);

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in max-w-7xl mx-auto">

      {/* ── Header ─────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#0891B2]/10 dark:bg-cyan-950/60 flex items-center justify-center text-[#0891B2]">
              <Newspaper size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Automated News Ingestion</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                Source:
                <a href="https://www.bhaskar.com/local/rajasthan/jalore/" target="_blank" rel="noopener noreferrer"
                  className="text-[#0891B2] hover:underline flex items-center gap-0.5 font-medium">
                  Dainik Bhaskar (Jalore) <ExternalLink size={11} />
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowLogsModal(true)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
          >
            <History size={16} /> Import Logs
          </button>

          {/* Clear All Pending & Re-sync */}
          <button
            onClick={handleClearAndResync}
            disabled={isBusy}
            title="Delete all pending articles and fetch fresh ones from Bhaskar"
            className="px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            <RotateCcw size={15} className={isClearing ? 'animate-spin' : ''} />
            {isClearing ? 'Clearing…' : 'Clear Pending & Re-sync'}
          </button>

          {/* Manual Sync */}
          <button
            onClick={handleManualSync}
            disabled={isBusy}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0891B2] to-[#0EA5E9] text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-[#0891B2]/20 hover:opacity-95 disabled:opacity-60 transition cursor-pointer"
          >
            <RefreshCw size={16} className={isSyncing || (serverStats.isSyncing ?? false) ? 'animate-spin' : ''} />
            {isSyncing ? 'Syncing…' : 'Sync Latest News Now'}
          </button>
        </div>
      </div>

      {/* ── Sync Status Bar ─────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#0F172A] text-white p-4 md:p-5 rounded-2xl shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${serverOffline ? 'bg-rose-400' : isBusy ? 'bg-cyan-400' : 'bg-emerald-400'}`} />
              <span className={`relative inline-flex rounded-full h-3 w-3 ${serverOffline ? 'bg-rose-500' : isBusy ? 'bg-cyan-500' : 'bg-emerald-500'}`} />
            </span>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Scheduler</span>
              <span className="font-semibold text-white">
                {serverOffline ? 'Service Offline' : isBusy ? 'Syncing Now…' : 'Every 1 Hour (Active)'}
              </span>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-700/60 hidden sm:block" />

          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#0891B2]" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Last Sync</span>
              <span className="font-semibold text-white">{formatTime(stats.lastSyncTime)}</span>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-700/60 hidden sm:block" />

          <div className="flex items-center gap-2">
            <CalendarCheck size={16} className="text-cyan-400" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Next Sync</span>
              <span className="font-semibold text-white">{formatTime(stats.nextSyncTime)}</span>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-700/60 hidden md:block" />

          <div className="flex items-center gap-2">
            <Radio size={16} className="text-amber-400" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Auto-Publish</span>
              <span className="font-semibold text-amber-300">
                {serverStats.autoPublishEnabled ? 'ON (Direct Publish)' : 'OFF (Admin Review)'}
              </span>
            </div>
          </div>
        </div>

        {serverStats.lastSyncResult && (
          <div className="text-[11px] text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 shrink-0">
            Last batch: <span className="text-emerald-400 font-semibold">+{serverStats.lastSyncResult.imported} new</span>,{' '}
            {serverStats.lastSyncResult.duplicates} duplicates
          </div>
        )}
      </div>

      {/* ── All-duplicates hint ──────────────────────────────────────────────────── */}
      {!isBusy && !serverOffline && serverStats.lastSyncResult && serverStats.lastSyncResult.imported === 0 && serverStats.lastSyncResult.duplicates > 0 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">All discovered articles already exist in database</h3>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                {serverStats.lastSyncResult.duplicates} articles from Bhaskar were skipped as duplicates. If the existing articles have incorrect data (wrong title, bad excerpt), use <strong>Clear Pending & Re-sync</strong> to delete old data and import fresh articles.
              </p>
            </div>
          </div>
          <button
            onClick={handleClearAndResync}
            disabled={isBusy}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-xs transition shrink-0 cursor-pointer disabled:opacity-50"
          >
            Clear & Re-sync
          </button>
        </div>
      )}

      {tableMissing && (
        <div className="p-5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={22} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">Supabase `news_articles` Table Schema Required</h3>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                Execute <code className="font-mono bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded">supabase/news_schema.sql</code> in Supabase SQL Editor.
              </p>
            </div>
          </div>
          <button
            onClick={async () => {
              const sqlRes = await fetch('/supabase/news_schema.sql');
              const sqlText = await sqlRes.text();
              navigator.clipboard.writeText(sqlText);
              toast.success('SQL copied to clipboard!');
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
              <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">News Fetcher Service Offline</h3>
              <p className="text-xs text-rose-700 dark:text-rose-400 mt-0.5">
                Start the backend service in your terminal:
                <code className="ml-1 font-mono bg-rose-100 dark:bg-rose-900/60 px-1.5 py-0.5 rounded">npm run dev</code>
                {' '}or{' '}
                <code className="font-mono bg-rose-100 dark:bg-rose-900/60 px-1.5 py-0.5 rounded">npm run news-fetcher</code>
              </p>
            </div>
          </div>
          <button
            onClick={() => { navigator.clipboard.writeText('npm run dev'); toast.success('Copied!'); }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs transition shrink-0 cursor-pointer"
          >
            Copy Command
          </button>
        </div>
      )}

      {/* ── Metric Cards ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Ingested</span>
            <Layers size={18} className="text-[#0891B2]" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalFetched}</div>
          <p className="text-[10px] text-slate-400 mt-1">In Supabase DB</p>
        </div>

        <div className="bg-white dark:bg-[#1E293B] border border-amber-500/30 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-amber-500 mb-2">
            <span className="text-xs font-semibold">Pending Review</span>
            <Clock size={18} />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</div>
          <p className="text-[10px] text-slate-400 mt-1">Awaiting approval</p>
        </div>

        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-emerald-500 mb-2">
            <span className="text-xs font-semibold">Approved</span>
            <CheckCircle size={18} />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.approved}</div>
          <p className="text-[10px] text-slate-400 mt-1">Ready for live</p>
        </div>

        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-[#0891B2] mb-2">
            <span className="text-xs font-semibold">Published</span>
            <FileCheck size={18} />
          </div>
          <div className="text-2xl font-bold text-[#0891B2] dark:text-cyan-400">{stats.published}</div>
          <p className="text-[10px] text-slate-400 mt-1">Live on website</p>
        </div>

        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-rose-500 mb-2">
            <span className="text-xs font-semibold">Rejected</span>
            <XCircle size={18} />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{stats.rejected}</div>
          <p className="text-[10px] text-slate-400 mt-1">Discarded items</p>
        </div>
      </div>

      {/* ── Filter Tabs & Search ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-4">
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

          {/* Bulk delete selected */}
          {selectedIds.size > 0 && (
            <button
              onClick={async () => {
                if (!window.confirm(`Delete ${selectedIds.size} selected articles?`)) return;
                try {
                  const { error } = await supabase.from('news_articles').delete().in('id', [...selectedIds]);
                  if (error) throw error;
                  toast.success(`${selectedIds.size} articles deleted.`);
                  setSelectedIds(new Set());
                  setArticles((prev) => prev.filter((a) => !selectedIds.has(a.id)));
                } catch (err: any) {
                  toast.error(`Failed: ${err.message}`);
                }
              }}
              className="ml-auto px-3 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-rose-700 transition cursor-pointer shrink-0"
            >
              <Trash2 size={13} /> Delete {selectedIds.size} Selected
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news titles, locations, or excerpts…"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0891B2]"
            />
          </div>
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
              <option value="Business">Business</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Article Grid ─────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-80 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <AlertCircle size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No News Articles Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
            Click Sync to fetch the latest Jalore news from Dainik Bhaskar.
          </p>
          <button
            onClick={handleManualSync}
            disabled={isBusy}
            className="px-5 py-2.5 rounded-xl bg-[#0891B2] text-white text-xs font-semibold shadow-sm hover:bg-cyan-700 transition cursor-pointer"
          >
            {isSyncing ? 'Syncing…' : 'Sync Latest News Now'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <NewsCard
              key={article.id}
              article={article}
              isSelected={selectedIds.has(article.id)}
              onToggleSelect={(id) => {
                setSelectedIds((prev) => {
                  const next = new Set(prev);
                  if (next.has(id)) next.delete(id); else next.add(id);
                  return next;
                });
              }}
              onEdit={(art) => setEditingArticle(art)}
              onApprove={(id) => handleUpdateStatus(id, 'approved')}
              onReject={(id) => handleUpdateStatus(id, 'rejected')}
              onPublish={(id) => handleUpdateStatus(id, 'published')}
              onDelete={handleDeleteArticle}
            />
          ))}
        </div>
      )}

      {editingArticle && (
        <NewsEditorModal
          article={editingArticle}
          onClose={() => setEditingArticle(null)}
          onSave={handleSaveArticle}
        />
      )}

      {showLogsModal && (
        <ImportLogsModal
          logs={logs}
          onClose={() => setShowLogsModal(false)}
          onRefresh={() => { fetchArticles(); fetchServerStatus(); }}
        />
      )}
    </div>
  );
};
