import { runNewsImporterPipeline } from '../services/newsImporter';
import { SyncPipelineResult } from '../types/news';

let intervalTimer: NodeJS.Timeout | null = null;
let lastSyncTime: string | null = null;
let nextSyncTime: string | null = null;
let isSyncRunning: boolean = false;
let lastSyncResult: SyncPipelineResult | null = null;

export function getSyncIntervalMinutes(): number {
  if (process.env.NEWS_SYNC_INTERVAL_MINUTES) {
    return Math.max(parseInt(process.env.NEWS_SYNC_INTERVAL_MINUTES, 10) || 60, 1);
  }
  if (process.env.NEWS_SYNC_INTERVAL_HOURS) {
    return Math.max(parseFloat(process.env.NEWS_SYNC_INTERVAL_HOURS) || 1, 0.1) * 60;
  }
  // Default to 60 minutes (1 Hour)
  return 60;
}

export function getSyncState() {
  return {
    lastSyncTime,
    nextSyncTime,
    isSyncRunning,
    intervalMinutes: getSyncIntervalMinutes(),
    autoPublishEnabled: process.env.AUTO_PUBLISH_NEWS === 'true',
    lastSyncResult,
  };
}

export async function executeNewsSync(triggeredBy: 'scheduler' | 'manual' = 'scheduler'): Promise<SyncPipelineResult> {
  if (isSyncRunning) {
    console.warn(`[ScheduledJob] Sync is already in progress. Ignoring duplicate trigger request (${triggeredBy}).`);
    return {
      discovered: 0,
      imported: 0,
      duplicates: 0,
      failed: 0,
      message: 'Sync is currently already in progress.',
      durationMs: 0,
      timestamp: new Date().toISOString(),
    };
  }

  try {
    isSyncRunning = true;
    const result = await runNewsImporterPipeline(triggeredBy);
    lastSyncTime = new Date().toISOString();
    lastSyncResult = result;

    const intervalMs = getSyncIntervalMinutes() * 60 * 1000;
    nextSyncTime = new Date(Date.now() + intervalMs).toISOString();

    return result;
  } finally {
    isSyncRunning = false;
  }
}

export function startScheduledNewsSync() {
  const intervalMinutes = getSyncIntervalMinutes();
  const intervalMs = intervalMinutes * 60 * 1000;

  console.log(`[ScheduledJob] Initializing background news sync worker. Interval: every ${intervalMinutes} minutes (1 Hour default).`);

  // Calculate next scheduled sync time from startup
  nextSyncTime = new Date(Date.now() + intervalMs).toISOString();

  // Run initial sync after 5 seconds startup delay
  setTimeout(() => {
    console.log('[ScheduledJob] Running initial sync after server startup...');
    executeNewsSync('scheduler').catch((err) =>
      console.error('[ScheduledJob] Initial sync error:', err)
    );
  }, 5000);

  // Schedule recurring syncs every 1 hour (configurable)
  if (intervalTimer) clearInterval(intervalTimer);
  intervalTimer = setInterval(() => {
    console.log(`[ScheduledJob] Running scheduled 1-hour news import task...`);
    executeNewsSync('scheduler').catch((err) =>
      console.error('[ScheduledJob] Recurring sync error:', err)
    );
  }, intervalMs);
}

export function stopScheduledNewsSync() {
  if (intervalTimer) {
    clearInterval(intervalTimer);
    intervalTimer = null;
    console.log('[ScheduledJob] Background news sync worker stopped.');
  }
}
