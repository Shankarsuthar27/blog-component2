import { NewsSourceAdapter, RawDiscoveredArticle } from '../types/news';
import { extractFullArticleDetails } from '../services/articleContentExtractor';

export class BhaskarJaloreAdapter implements NewsSourceAdapter {
  name = 'Dainik Bhaskar';
  baseUrl = 'https://www.bhaskar.com';
  targetUrl = 'https://www.bhaskar.com/local/rajasthan/jalore/';

  async fetchLatestNews(): Promise<RawDiscoveredArticle[]> {
    const articles: RawDiscoveredArticle[] = [];

    try {
      // 1. Try fetching from RSS Feed first (official/permitted feed)
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

        while ((match = itemRegex.exec(xmlText)) !== null && articles.length < 15) {
          const itemBlock = match[1];
          const titleMatch = /<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title>([\s\S]*?)<\/title>/i.exec(itemBlock);
          const linkMatch = /<link><!\[CDATA\[([\s\S]*?)\]\]><\/link>|<link>([\s\S]*?)<\/link>/i.exec(itemBlock);
          const descMatch = /<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<description>([\s\S]*?)<\/description>/i.exec(itemBlock);
          const pubDateMatch = /<pubDate>([\s\S]*?)<\/pubDate>/i.exec(itemBlock);

          const title = (titleMatch?.[1] || titleMatch?.[2] || '').trim();
          const link = (linkMatch?.[1] || linkMatch?.[2] || '').trim();
          const description = (descMatch?.[1] || descMatch?.[2] || '').trim();
          const pubDate = pubDateMatch?.[1] ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString();

          // Fetch full article body text & high-res image
          const fullDetails = link ? await extractFullArticleDetails(link) : { content: '', featuredImage: undefined };

          if (title && link) {
            articles.push({
              title,
              sourceUrl: link,
              sourceName: this.name,
              sourcePublishedAt: pubDate,
              excerpt: description,
              content: fullDetails.content || description,
              featuredImage: fullDetails.featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200',
              category: 'Jalore',
              location: 'Jalore, Rajasthan',
              author: 'Dainik Bhaskar',
            });
          }
        }
      }
    } catch (err) {
      console.warn('[BhaskarAdapter] RSS fetch failed, checking fallback endpoints:', err);
    }

    // 2. If RSS feed returned fewer than 3 items or failed, fetch permitted HTML metadata
    if (articles.length === 0) {
      try {
        const pageRes = await fetch(this.targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) InsightJournalNewsImporter/1.0',
            'Accept': 'text/html,application/xhtml+xml',
          },
        });

        if (pageRes.ok) {
          const html = await pageRes.text();
          const linkRegex = /<a[^>]+href="(\/local\/rajasthan\/jalore\/[^\"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
          let match: RegExpExecArray | null;
          const seenUrls = new Set<string>();

          while ((match = linkRegex.exec(html)) !== null && articles.length < 10) {
            const rawPath = match[1];
            const rawContent = match[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            const fullUrl = rawPath.startsWith('http') ? rawPath : `${this.baseUrl}${rawPath}`;

            if (rawContent.length >= 15 && !seenUrls.has(fullUrl)) {
              seenUrls.add(fullUrl);
              const fullDetails = await extractFullArticleDetails(fullUrl);
              articles.push({
                title: rawContent,
                sourceUrl: fullUrl,
                sourceName: this.name,
                sourcePublishedAt: new Date().toISOString(),
                excerpt: `जालोर समाचार — ${rawContent}`,
                content: fullDetails.content || `जालोर समाचार — ${rawContent}`,
                featuredImage: fullDetails.featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200',
                category: 'Jalore',
                location: 'Jalore, Rajasthan',
                author: 'Dainik Bhaskar',
              });
            }
          }
        }
      } catch (err) {
        console.error('[BhaskarAdapter] HTML metadata fetch failed:', err);
      }
    }

    return articles;
  }
}
