export async function extractArticleOgImage(url: string): Promise<string | undefined> {
  if (!url || !url.startsWith('http')) return undefined;
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) InsightJournalNewsImporter/1.0',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });

    if (response.ok) {
      const html = await response.text();
      const match =
        html.match(/<meta[^>]+(?:property=["']og:image["']|name=["']twitter:image["']|itemprop=["']image["'])[^>]+content=["']([^"']+)["']/i) ||
        html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property=["']og:image["']|name=["']twitter:image["']|itemprop=["']image["'])/i);

      if (match?.[1]) {
        const imageUrl = match[1].trim();
        if (imageUrl.startsWith('http')) {
          return imageUrl;
        }
      }
    }
  } catch (err) {
    // Fail silently and return undefined to fallback gracefully
  }
  return undefined;
}
