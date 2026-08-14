import { NewsSourceAdapter, RawDiscoveredArticle } from '../types/news';
import { extractFullArticleDetails } from '../services/articleContentExtractor';

export class GoogleNewsJaloreAdapter implements NewsSourceAdapter {
  name = 'Google News (Jalore)';
  baseUrl = 'https://news.google.com';
  targetUrl = 'https://news.google.com/rss/search?q=Jalore+Rajasthan&hl=hi&gl=IN&ceid=IN:hi';

  async fetchLatestNews(): Promise<RawDiscoveredArticle[]> {
    const articles: RawDiscoveredArticle[] = [];
    try {
      console.log(`[GoogleNewsAdapter] Fetching Jalore live news RSS feed...`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(this.targetUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml',
        },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const xml = await res.text();
        const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
        let match: RegExpExecArray | null;
        const seen = new Set<string>();

        while ((match = itemRegex.exec(xml)) !== null && articles.length < 8) {
          const itemXml = match[1];

          const titleMatch = /<title>([\s\S]*?)<\/title>/i.exec(itemXml);
          const linkMatch = /<link>([\s\S]*?)<\/link>/i.exec(itemXml);
          const pubDateMatch = /<pubDate>([\s\S]*?)<\/pubDate>/i.exec(itemXml);
          const sourceMatch = /<source[^>]*>([\s\S]*?)<\/source>/i.exec(itemXml);

          let title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim() : '';
          let link = linkMatch ? linkMatch[1].trim() : '';
          const pubDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString();
          const sourceName = sourceMatch ? sourceMatch[1].replace(/<[^>]+>/g, '').trim() : 'Google News';

          // Clean title if it ends with source name e.g. "Title - Dainik Bhaskar"
          if (title.includes(' - ')) {
            const parts = title.split(' - ');
            title = parts.slice(0, -1).join(' - ').trim();
          }

          if (title.length >= 10 && link && !seen.has(title)) {
            seen.add(title);

            // Extract details if possible
            let fullDetails: any = {};
            try {
              fullDetails = await extractFullArticleDetails(link);
            } catch {
              fullDetails = {};
            }

            articles.push({
              title,
              sourceUrl: fullDetails.canonicalUrl || link,
              sourceName: sourceName || 'Jalore News',
              sourcePublishedAt: new Date(pubDate).toISOString(),
              excerpt: fullDetails.content
                ? fullDetails.content.replace(/<[^>]+>/g, ' ').substring(0, 180) + '...'
                : `जांच खबर जालोर — ${title}`,
              content: fullDetails.content || `<p>${title}</p><p>जालोर जिले की नवीनतम समाचार अपडेट।</p>`,
              featuredImage:
                fullDetails.featuredImage ||
                'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200',
              category: 'Jalore',
              location: 'Jalore, Rajasthan',
              author: sourceName || 'News Reporter',
            });
          }
        }
      }
    } catch (e) {
      console.warn('[GoogleNewsAdapter] RSS Fetch failed:', e);
    }
    return articles;
  }
}
