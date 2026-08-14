import { supabaseServer } from '../lib/supabase';
import { discoverNewsFromAllSources } from './sourceFetcher';
import { parseAndFormatArticle } from './articleParser';
import { generateSlug } from './slugGenerator';
import { calculateContentHash, isDuplicate } from './duplicateChecker';
import { generateAISummary } from './summarizer';
import { SyncPipelineResult } from '../types/news';

export async function runNewsImporterPipeline(
  triggeredBy: 'scheduler' | 'manual' = 'scheduler'
): Promise<SyncPipelineResult> {
  const startTime = Date.now();
  console.log(`[NewsImporter] Starting Jalore News automated ingestion pipeline (Trigger: ${triggeredBy})...`);

  let discovered = 0;
  let imported = 0;
  let duplicates = 0;
  let failed = 0;

  const autoPublish = process.env.AUTO_PUBLISH_NEWS === 'true';
  const defaultStatus = autoPublish ? 'published' : 'pending';

  console.log(`[NewsImporter] Ingestion configuration: AUTO_PUBLISH_NEWS=${autoPublish} (New articles status: ${defaultStatus})`);

  try {
    const rawArticles = await discoverNewsFromAllSources();
    discovered = rawArticles.length;

    if (discovered === 0) {
      const durationMs = Date.now() - startTime;
      console.log('[NewsImporter] No new articles discovered across sources.');

      // Record batch completion log
      try {
        await supabaseServer.from('news_import_logs').insert({
          source_name: 'Dainik Bhaskar',
          source_url: 'https://www.bhaskar.com/local/rajasthan/jalore/',
          status: 'batch_completed',
          discovered_count: 0,
          imported_count: 0,
          duplicate_count: 0,
          failed_count: 0,
          duration_ms: durationMs,
          triggered_by: triggeredBy,
          error_message: null,
        });
      } catch (logErr) {
        console.warn('[NewsImporter] Failed to write batch log to Supabase:', logErr);
      }

      return {
        discovered: 0,
        imported: 0,
        duplicates: 0,
        failed: 0,
        message: 'No articles discovered from sources',
        durationMs,
        timestamp: new Date().toISOString(),
      };
    }

    for (const rawArticle of rawArticles) {
      try {
        // 1. Parse & Clean raw article
        const parsed = parseAndFormatArticle(rawArticle);

        if (!parsed.sourceUrl || !parsed.title) {
          console.warn('[NewsImporter] Skipping invalid article payload (missing title/URL)');
          failed++;
          continue;
        }

        // 2. Slug generation
        const slug = generateSlug(parsed.title, parsed.sourceUrl);

        // 3. Calculate content hash
        const contentHash = calculateContentHash(parsed.title, parsed.excerpt, parsed.content);

        // 4. Duplicate Check
        const dupCheck = await isDuplicate(supabaseServer, parsed.sourceUrl, slug, contentHash);
        if (dupCheck.isDuplicate) {
          console.log(`[NewsImporter] Skipped duplicate article (${dupCheck.reason}): "${parsed.title}"`);
          duplicates++;
          continue;
        }

        // 5. AI Summarization / Truthful facts summary
        const aiResult = await generateAISummary(parsed.title, parsed.content, parsed.sourceName);

        // 6. Save to Supabase
        const nowIso = new Date().toISOString();

        // Build insert payload with only guaranteed columns.
        // Optional columns (gallery_images, video_url, seo_*, tags, etc.) are added
        // conditionally so inserts don't fail if the live table schema is older.
        const insertPayload: Record<string, unknown> = {
          title: parsed.title,
          slug,
          excerpt: aiResult.excerpt || parsed.excerpt,
          content: parsed.content,
          source_name: parsed.sourceName,
          source_url: parsed.sourceUrl,
          source_published_at: parsed.sourcePublishedAt,
          imported_at: nowIso,
          published_at: autoPublish ? nowIso : null,
          status: defaultStatus,
          content_hash: contentHash,
        };

        // Add optional columns only when they have a value (avoids PGRST204 on older schemas)
        if (parsed.category)      insertPayload.category       = parsed.category;
        if (parsed.location)      insertPayload.location       = parsed.location;
        if (parsed.author)        insertPayload.author         = parsed.author;
        if (parsed.featuredImage) insertPayload.featured_image = parsed.featuredImage;
        if (parsed.videoUrl)      insertPayload.video_url      = parsed.videoUrl;
        if (aiResult.summary)     insertPayload.summary        = aiResult.summary;

        // Array-type optional columns
        if (aiResult.tags?.length || parsed.tags?.length)
          insertPayload.tags = aiResult.tags || parsed.tags;
        if (parsed.galleryImages?.length)
          insertPayload.gallery_images = parsed.galleryImages;

        // SEO optional columns
        if (aiResult.seoTitle    || parsed.seoTitle)    insertPayload.seo_title       = aiResult.seoTitle    || parsed.seoTitle;
        if (aiResult.seoDescription || parsed.seoDescription) insertPayload.seo_description = aiResult.seoDescription || parsed.seoDescription;
        if (aiResult.keywords?.length || parsed.seoKeywords?.length)
          insertPayload.seo_keywords = aiResult.keywords || parsed.seoKeywords;

        // Boolean/integer defaults — include them, they exist in all schema versions
        insertPayload.is_featured = false;
        insertPayload.views       = 0;

        const { error: insertErr } = await supabaseServer.from('news_articles').insert(insertPayload);

        if (insertErr) {
          // If error is unique constraint violation on source_url or slug, count as duplicate
          if (insertErr.code === '23505' || insertErr.message?.includes('duplicate key')) {
            console.log(`[NewsImporter] Article already exists in DB (unique constraint hit): ${parsed.sourceUrl}`);
            duplicates++;
          } else {
            console.error(`[NewsImporter] Failed to insert article: ${parsed.sourceUrl}`, insertErr);
            failed++;
            try {
              await supabaseServer.from('news_import_logs').insert({
                source_name: parsed.sourceName,
                source_url: parsed.sourceUrl,
                status: 'failed',
                error_message: insertErr.message || JSON.stringify(insertErr),
                triggered_by: triggeredBy,
              });
            } catch {}
          }
        } else {
          console.log(`[NewsImporter] Successfully imported article (${defaultStatus}): "${parsed.title}"`);
          imported++;
          try {
            await supabaseServer.from('news_import_logs').insert({
              source_name: parsed.sourceName,
              source_url: parsed.sourceUrl,
              status: 'imported',
              error_message: null,
              triggered_by: triggeredBy,
            });
          } catch {}
        }
      } catch (articleErr: any) {
        console.error(`[NewsImporter] Error processing individual article: ${rawArticle.sourceUrl}`, articleErr);
        failed++;
        try {
          await supabaseServer.from('news_import_logs').insert({
            source_name: rawArticle.sourceName || 'Dainik Bhaskar',
            source_url: rawArticle.sourceUrl,
            status: 'failed',
            error_message: articleErr?.message || 'Processing exception',
            triggered_by: triggeredBy,
          });
        } catch {}
      }
    }
  } catch (err: any) {
    console.error('[NewsImporter] Global ingestion pipeline error:', err);
    failed = failed || 1;
  }

  const durationMs = Date.now() - startTime;
  const message = `Sync Complete: ${discovered} discovered, ${imported} new articles imported, ${duplicates} duplicates skipped, ${failed} failed (${(durationMs / 1000).toFixed(1)}s).`;
  console.log(`[NewsImporter] ${message}`);

  // Record batch log entry
  try {
    await supabaseServer.from('news_import_logs').insert({
      source_name: 'Dainik Bhaskar',
      source_url: 'https://www.bhaskar.com/local/rajasthan/jalore/',
      status: failed > 0 && imported === 0 ? 'batch_failed' : 'batch_completed',
      discovered_count: discovered,
      imported_count: imported,
      duplicate_count: duplicates,
      failed_count: failed,
      duration_ms: durationMs,
      triggered_by: triggeredBy,
      error_message: failed > 0 ? `${failed} articles failed during processing` : null,
    });
  } catch (logErr) {
    console.warn('[NewsImporter] Failed to record batch completion log:', logErr);
  }

  return {
    discovered,
    imported,
    duplicates,
    failed,
    message,
    durationMs,
    timestamp: new Date().toISOString(),
  };
}
