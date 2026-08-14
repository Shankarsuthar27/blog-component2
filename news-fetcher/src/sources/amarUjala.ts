import { NewsSourceAdapter, RawDiscoveredArticle } from '../types/news';
import { extractFullArticleDetails } from '../services/articleContentExtractor';

export class AmarUjalaJaloreAdapter implements NewsSourceAdapter {
  name = 'Amar Ujala';
  baseUrl = 'https://www.amarujala.com';
  targetUrl = 'https://www.amarujala.com/rajasthan/jalore';

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
        const linkRegex = /<a[^>]+href="(\/rajasthan\/jalore\/[^\"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
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
              excerpt: `अमर उजाला जालोर — ${rawContent}`,
              content: fullDetails.content || `अमर उजाला जालोर — ${rawContent}`,
              featuredImage: fullDetails.featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200',
              category: 'Jalore',
              location: 'Jalore, Rajasthan',
              author: 'Amar Ujala',
            });
          }
        }
      }
    } catch (e) {
      console.warn('[AmarUjalaAdapter] Fetch failed:', e);
    }
    return articles;
  }
}
