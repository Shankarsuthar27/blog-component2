import { supabaseServer } from '../lib/supabase';
import { discoverNewsFromAllSources } from './sourceFetcher';
import { parseAndFormatArticle } from './articleParser';
import { generateSlug } from './slugGenerator';
import { calculateContentHash, isDuplicate } from './duplicateChecker';
import { generateAISummary } from './summarizer';

export async function runNewsImporterPipeline(): Promise<{
  discovered: number;
  imported: number;
  duplicates: number;
  failed: number;
  message: string;
}> {
  console.log('[NewsImporter] Starting Jalore News automated ingestion pipeline...');
  let discovered = 0;
  let imported = 0;
  let duplicates = 0;
  let failed = 0;

  try {
    const rawArticles = await discoverNewsFromAllSources();
    discovered = rawArticles.length;

    if (discovered === 0) {
      console.log('[NewsImporter] No new articles discovered across sources.');
      return {
        discovered: 0,
        imported: 0,
        duplicates: 0,
        failed: 0,
        message: 'No articles discovered from sources',
      };
    }

    for (const rawArticle of rawArticles) {
      try {
        // 1. Parse & Clean raw article
        const parsed = parseAndFormatArticle(rawArticle);

        // 2. Slug generation
        const slug = generateSlug(parsed.title, parsed.sourceUrl);

        // 3. Calculate content hash
        const contentHash = calculateContentHash(parsed.title, parsed.excerpt, parsed.content);

        // 4. Duplicate Check
        const dupCheck = await isDuplicate(supabaseServer, parsed.sourceUrl, slug, contentHash);
        if (dupCheck.isDuplicate) {
          console.log(`[NewsImporter] Skipped duplicate article (${dupCheck.reason}): ${parsed.title}`);
          duplicates++;
          continue;
        }

        // 5. AI Summarization / Truthful facts summary
        const aiResult = await generateAISummary(parsed.title, parsed.content, parsed.sourceName);

        // 6. Save to Supabase with status = 'pending'
        const { error: insertErr } = await supabaseServer.from('news_articles').insert({
          title: parsed.title,
          slug,
          excerpt: aiResult.excerpt || parsed.excerpt,
          content: parsed.content,
          summary: aiResult.summary,
          category: parsed.category,
          location: parsed.location,
          author: parsed.author,
          featured_image: parsed.featuredImage,
          video_url: parsed.videoUrl,
          gallery_images: parsed.galleryImages,
          source_name: parsed.sourceName,
          source_url: parsed.sourceUrl,
          source_published_at: parsed.sourcePublishedAt,
          status: 'pending',
          is_featured: false,
          views: 0,
          tags: aiResult.tags || parsed.tags,
          seo_title: aiResult.seoTitle || parsed.seoTitle,
          seo_description: aiResult.seoDescription || parsed.seoDescription,
          seo_keywords: aiResult.keywords || parsed.seoKeywords,
          content_hash: contentHash,
        });

        if (insertErr) {
          console.error(`[NewsImporter] Failed to insert article: ${parsed.sourceUrl}`, insertErr);
          failed++;
          // Log error in news_import_logs table
          await supabaseServer.from('news_import_logs').insert({
            source_name: parsed.sourceName,
            source_url: parsed.sourceUrl,
            status: 'failed',
            error_message: insertErr.message || JSON.stringify(insertErr),
          });
        } else {
          console.log(`[NewsImporter] Successfully imported pending article: "${parsed.title}"`);
          imported++;
          // Log success in news_import_logs
          await supabaseServer.from('news_import_logs').insert({
            source_name: parsed.sourceName,
            source_url: parsed.sourceUrl,
            status: 'imported',
            error_message: null,
          });
        }
      } catch (articleErr: any) {
        console.error(`[NewsImporter] Error processing individual article: ${rawArticle.sourceUrl}`, articleErr);
        failed++;
        await supabaseServer.from('news_import_logs').insert({
          source_name: rawArticle.sourceName || 'Dainik Bhaskar',
          source_url: rawArticle.sourceUrl,
          status: 'failed',
          error_message: articleErr?.message || 'Processing exception',
        });
      }
    }
  } catch (err: any) {
    console.error('[NewsImporter] Global ingestion pipeline error:', err);
    return {
      discovered,
      imported,
      duplicates,
      failed: failed || 1,
      message: `Sync encountered error: ${err?.message || 'Unknown error'}`,
    };
  }

  const message = `Sync Complete: ${discovered} discovered, ${imported} new articles imported, ${duplicates} duplicates skipped, ${failed} failed.`;
  console.log(`[NewsImporter] ${message}`);
  return {
    discovered,
    imported,
    duplicates,
    failed,
    message,
  };
}
