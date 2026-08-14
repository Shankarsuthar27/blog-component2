import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { runNewsImporterPipeline } from './services/newsImporter';
import { startScheduledNewsSync } from './jobs/fetchJaloreNews';
import { supabaseServer } from './lib/supabase';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
const PORT = process.env.NEWS_FETCHER_PORT || process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'News Fetcher API', timestamp: new Date().toISOString() });
});

// Endpoint for manual trigger from Admin Panel "↻ Sync Latest News"
app.post('/api/news/sync', async (req, res) => {
  try {
    console.log('[API] Manual sync request received from Admin Panel.');
    const result = await runNewsImporterPipeline();
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
      message: error?.message || 'Failed to execute news sync pipeline',
    });
  }
});

// Endpoint for fetching news stats
app.get('/api/news/status', async (req, res) => {
  try {
    const { count: totalFetched } = await supabaseServer.from('news_articles').select('*', { count: 'exact', head: true });
    const { count: pending } = await supabaseServer.from('news_articles').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    const { count: approved } = await supabaseServer.from('news_articles').select('*', { count: 'exact', head: true }).eq('status', 'approved');
    const { count: published } = await supabaseServer.from('news_articles').select('*', { count: 'exact', head: true }).eq('status', 'published');
    const { count: rejected } = await supabaseServer.from('news_articles').select('*', { count: 'exact', head: true }).eq('status', 'rejected');
    
    // Fetch last sync time
    const { data: latestLog } = await supabaseServer
      .from('news_import_logs')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    res.json({
      totalFetched: totalFetched || 0,
      pending: pending || 0,
      approved: approved || 0,
      published: published || 0,
      rejected: rejected || 0,
      duplicates: 0,
      lastSyncTime: latestLog?.created_at || null,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint for fetching logs
app.get('/api/news/logs', async (req, res) => {
  try {
    const { data, error } = await supabaseServer
      .from('news_import_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Start server and background sync worker
app.listen(PORT, () => {
  console.log(`[NewsFetcherServer] News Ingestion HTTP Service running on http://localhost:${PORT}`);
  startScheduledNewsSync();
});
