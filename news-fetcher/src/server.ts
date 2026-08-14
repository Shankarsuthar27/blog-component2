import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { startScheduledNewsSync, executeNewsSync, getSyncState } from './jobs/fetchJaloreNews';
import { supabaseServer } from './lib/supabase';

// Load environment configuration
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'news-fetcher/.env') });

const app = express();
const PORT = process.env.NEWS_FETCHER_PORT || process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'News Fetcher & Synchronization Service',
    source: 'https://www.bhaskar.com/local/rajasthan/jalore/',
    timestamp: new Date().toISOString(),
  });
});

// Endpoint for manual sync trigger: "Sync Latest News Now"
app.post('/api/news/sync', async (req, res) => {
  try {
    console.log('[API] Manual sync requested from Admin Panel.');
    const result = await executeNewsSync('manual');
    res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('[API] Manual sync failed:', error);
    res.status(500).json({
      success: false,
      discovered: 0,
      imported: 0,
      duplicates: 0,
      failed: 1,
      durationMs: 0,
      timestamp: new Date().toISOString(),
      message: error?.message || 'Failed to execute news sync pipeline',
    });
  }
});

// Delete a single news article by ID
app.delete('/api/news/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Article ID is required' });

    const { error } = await supabaseServer.from('news_articles').delete().eq('id', id);
    if (error) throw error;

    res.json({ success: true, message: `Article ${id} deleted.` });
  } catch (err: any) {
    console.error('[API] Failed to delete article:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Bulk delete news articles by status (e.g. clear all 'pending')
app.delete('/api/news/articles', async (req, res) => {
  try {
    const { status, ids } = req.body as { status?: string; ids?: string[] };

    if (ids && Array.isArray(ids) && ids.length > 0) {
      // Delete by explicit list of IDs
      const { error } = await supabaseServer.from('news_articles').delete().in('id', ids);
      if (error) throw error;
      res.json({ success: true, message: `${ids.length} articles deleted.` });
    } else if (status) {
      // Delete all articles of a given status
      const { count, error } = await supabaseServer
        .from('news_articles')
        .delete({ count: 'exact' })
        .eq('status', status);
      if (error) throw error;
      res.json({ success: true, message: `${count ?? 0} ${status} articles deleted.`, count });
    } else {
      res.status(400).json({ error: 'Provide either "ids" array or "status" string in request body.' });
    }
  } catch (err: any) {
    console.error('[API] Failed to bulk delete articles:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Endpoint for fetching news stats, scheduler status, and last/next sync timestamps
app.get('/api/news/status', async (req, res) => {
  try {
    const syncState = getSyncState();

    // Query article counts in parallel
    const [totalRes, pendingRes, approvedRes, publishedRes, rejectedRes, latestLogRes] = await Promise.all([
      supabaseServer.from('news_articles').select('*', { count: 'exact', head: true }),
      supabaseServer.from('news_articles').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabaseServer.from('news_articles').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabaseServer.from('news_articles').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabaseServer.from('news_articles').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
      supabaseServer
        .from('news_import_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const lastSyncTime = syncState.lastSyncTime || latestLogRes.data?.created_at || null;

    res.json({
      totalFetched: totalRes.count || 0,
      pending: pendingRes.count || 0,
      approved: approvedRes.count || 0,
      published: publishedRes.count || 0,
      rejected: rejectedRes.count || 0,
      duplicates: 0,
      lastSyncTime,
      nextSyncTime: syncState.nextSyncTime,
      isSyncing: syncState.isSyncRunning,
      intervalMinutes: syncState.intervalMinutes,
      autoPublishEnabled: syncState.autoPublishEnabled,
      lastSyncResult: syncState.lastSyncResult,
    });
  } catch (err: any) {
    console.error('[API] Error in /api/news/status:', err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint for fetching import logs
app.get('/api/news/logs', async (req, res) => {
  try {
    const { data, error } = await supabaseServer
      .from('news_import_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(60);

    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    console.error('[API] Error in /api/news/logs:', err);
    res.status(500).json({ error: err.message });
  }
});

// Start server and initialize hourly background sync worker
app.listen(PORT, () => {
  console.log(`[NewsFetcherServer] News Ingestion HTTP Service running on http://localhost:${PORT}`);
  startScheduledNewsSync();
});
