import { NewsSourceAdapter, RawDiscoveredArticle } from '../types/news';
import { extractFullArticleDetails } from '../services/articleContentExtractor';

export class BhaskarJaloreAdapter implements NewsSourceAdapter {
  name = 'Dainik Bhaskar';
  baseUrl = 'https://www.bhaskar.com';
  targetUrl = 'https://www.bhaskar.com/local/rajasthan/jalore/';

  async fetchLatestNews(): Promise<RawDiscoveredArticle[]> {
    const articles: RawDiscoveredArticle[] = [];
    const seenUrls = new Set<string>();

    try {
      console.log(`[BhaskarAdapter] Fetching Jalore news from target: ${this.targetUrl}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const pageRes = await fetch(this.targetUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 InsightJournalNewsImporter/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
        },
      });
      clearTimeout(timeoutId);

      if (pageRes.ok) {
        const html = await pageRes.text();

        // Match all article links under /local/rajasthan/jalore/
        const linkRegex = /<a[^>]+href="(\/local\/rajasthan\/jalore\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
        let match: RegExpExecArray | null;

        // Discovered links list
        const candidateLinks: { path: string; rawText: string }[] = [];

        while ((match = linkRegex.exec(html)) !== null) {
          const rawPath = match[1];
          const rawContent = match[2]
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .replace(/\b\d+:\d+\s+Play\s+video\b/gi, '') // Remove video duration badge text
            .replace(/Play video/gi, '')
            .trim();

          const fullUrl = rawPath.startsWith('http') ? rawPath : `${this.baseUrl}${rawPath}`;

          // Only accept real article URLs — they must contain /news/ and end with .html
          // Navigation/city pages like /local/rajasthan/jalore/malwada/ are not articles
          const isRealArticle = rawPath.includes('/news/') && rawPath.endsWith('.html');

          if (
            isRealArticle &&
            rawContent.length >= 10 &&
            !seenUrls.has(fullUrl)
          ) {
            seenUrls.add(fullUrl);
            candidateLinks.push({ path: fullUrl, rawText: rawContent });
          }
        }

        console.log(`[BhaskarAdapter] Discovered ${candidateLinks.length} article links on Jalore page.`);

        // Fetch article details concurrently in small batches
        const maxArticles = Math.min(candidateLinks.length, 12);
        for (let i = 0; i < maxArticles; i++) {
          const item = candidateLinks[i];
          try {
            const fullDetails = await extractFullArticleDetails(item.path);

            // Use the proper title from og:title/h1 on the article page.
            // The link text (item.rawText) is just navigation text — often incomplete.
            const articleTitle = fullDetails.title || item.rawText;

            // Use extracted content for a real excerpt; fall back to link text only if nothing extracted
            const cleanBodyText = fullDetails.content
              ? fullDetails.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
              : '';
            const excerpt = cleanBodyText.length > 30
              ? (cleanBodyText.length > 200 ? cleanBodyText.substring(0, 200) + '...' : cleanBodyText)
              : articleTitle;

            articles.push({
              title: articleTitle,
              sourceUrl: item.path,
              sourceName: this.name,
              sourcePublishedAt: fullDetails.publishedAt || new Date().toISOString(),
              excerpt,
              content: fullDetails.content || `<p>${articleTitle}</p>`,
              featuredImage:
                fullDetails.featuredImage ||
                'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200',
              category: 'Jalore',
              location: 'Jalore, Rajasthan',
              author: 'Dainik Bhaskar',
            });
          } catch (itemErr) {
            console.warn(`[BhaskarAdapter] Failed to extract article at ${item.path}:`, itemErr);
          }
        }
      }
    } catch (err) {
      console.error('[BhaskarAdapter] Direct page fetch failed:', err);
    }

    // Fallback or supplement from RSS Feed if available
    if (articles.length === 0) {
      try {
        console.log('[BhaskarAdapter] Attempting RSS feed fallback...');
        const rssRes = await fetch('https://www.bhaskar.com/rss-v1/1061.xml', {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) InsightJournalNewsImporter/1.0',
            'Accept': 'application/rss+xml, application/xml, text/xml',
          },
        });

        if (rssRes.ok) {
          const xmlText = await rssRes.text();
          const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
          let match: RegExpExecArray | null;

          while ((match = itemRegex.exec(xmlText)) !== null && articles.length < 10) {
            const itemBlock = match[1];
            const titleMatch = /<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title>([\s\S]*?)<\/title>/i.exec(itemBlock);
            const linkMatch = /<link><!\[CDATA\[([\s\S]*?)\]\]><\/link>|<link>([\s\S]*?)<\/link>/i.exec(itemBlock);
            const descMatch = /<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<description>([\s\S]*?)<\/description>/i.exec(itemBlock);
            const pubDateMatch = /<pubDate>([\s\S]*?)<\/pubDate>/i.exec(itemBlock);

            const title = (titleMatch?.[1] || titleMatch?.[2] || '').trim();
            const link = (linkMatch?.[1] || linkMatch?.[2] || '').trim();
            const description = (descMatch?.[1] || descMatch?.[2] || '').trim();
            const pubDate = pubDateMatch?.[1] ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString();

            if (title && link && !seenUrls.has(link)) {
              seenUrls.add(link);
              const fullDetails = await extractFullArticleDetails(link);

              articles.push({
                title,
                sourceUrl: link,
                sourceName: this.name,
                sourcePublishedAt: pubDate,
                excerpt: description || `जालोर समाचार — ${title}`,
                content: fullDetails.content || description || `<p>${title}</p>`,
                featuredImage:
                  fullDetails.featuredImage ||
                  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200',
                category: 'Jalore',
                location: 'Jalore, Rajasthan',
                author: 'Dainik Bhaskar',
              });
            }
          }
        }
      } catch (rssErr) {
        console.warn('[BhaskarAdapter] RSS fallback failed:', rssErr);
      }
    }

    return articles;
  }
}
