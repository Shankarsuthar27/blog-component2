import { NewsSourceAdapter, RawDiscoveredArticle } from '../types/news';
import { extractFullArticleDetails } from '../services/articleContentExtractor';

export class PatrikaJaloreAdapter implements NewsSourceAdapter {
  name = 'Patrika';
  baseUrl = 'https://www.patrika.com';
  targetUrl = 'https://www.patrika.com/jalore-news/';

  async fetchLatestNews(): Promise<RawDiscoveredArticle[]> {
    const articles: RawDiscoveredArticle[] = [];
    try {
      const res = await fetch(this.targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) InsightJournalNewsImporter/1.0',
        },
      });
      if (res.ok) {
        const html = await res.text();
        const linkRegex = /<a[^>]+href="(\/jalore-news\/[^\"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
        let match: RegExpExecArray | null;
        const seenUrls = new Set<string>();

        while ((match = linkRegex.exec(html)) !== null && articles.length < 5) {
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
              excerpt: `पत्रिका जालोर — ${rawContent}`,
              content: fullDetails.content || `पत्रिका जालोर — ${rawContent}`,
              featuredImage: fullDetails.featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=1200',
              category: 'Jalore',
              location: 'Jalore, Rajasthan',
              author: 'Patrika News',
            });
          }
        }
      }
    } catch (e) {
      console.warn('[PatrikaAdapter] Fetch failed:', e);
    }
    return articles;
  }
}
