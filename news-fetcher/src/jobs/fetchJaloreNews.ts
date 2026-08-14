import { runNewsImporterPipeline } from '../services/newsImporter';

let intervalTimer: NodeJS.Timeout | null = null;

export function startScheduledNewsSync() {
  const intervalMinutes = parseInt(process.env.NEWS_SYNC_INTERVAL || '30', 10);
  const intervalMs = Math.max(intervalMinutes, 1) * 60 * 1000;

  console.log(`[ScheduledJob] Initializing background news sync worker. Interval: every ${intervalMinutes} minutes.`);

  // Run initial sync after 5 seconds startup delay
  setTimeout(() => {
    runNewsImporterPipeline().catch((err) =>
      console.error('[ScheduledJob] Initial sync error:', err)
    );
  }, 5000);

  // Schedule recurring syncs
  if (intervalTimer) clearInterval(intervalTimer);
  intervalTimer = setInterval(() => {
    console.log(`[ScheduledJob] Running scheduled news import task...`);
    runNewsImporterPipeline().catch((err) =>
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
