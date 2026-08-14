import { RawDiscoveredArticle } from '../types/news';
import { REGISTERED_SOURCES } from '../sources/index';

export async function discoverNewsFromAllSources(): Promise<RawDiscoveredArticle[]> {
  const allArticles: RawDiscoveredArticle[] = [];

  for (const sourceAdapter of REGISTERED_SOURCES) {
    try {
      console.log(`[SourceFetcher] Discovering news from ${sourceAdapter.name}...`);
      const discovered = await sourceAdapter.fetchLatestNews();
      console.log(`[SourceFetcher] Discovered ${discovered.length} articles from ${sourceAdapter.name}.`);
      allArticles.push(...discovered);
    } catch (err) {
      console.error(`[SourceFetcher] Failed to discover from ${sourceAdapter.name}:`, err);
    }
  }

  return allArticles;
}
