export async function extractFullArticleDetails(url: string): Promise<{
  content: string;
  featuredImage?: string;
}> {
  if (!url || !url.startsWith('http')) {
    return { content: '' };
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) InsightJournalNewsImporter/1.0',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });

    if (!res.ok) return { content: '' };
    const html = await res.text();

    const imageMatch =
      html.match(/<meta[^>]+(?:property=["']og:image["']|name=["']twitter:image["']|itemprop=["']image["'])[^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property=["']og:image["']|name=["']twitter:image["']|itemprop=["']image["'])/i);
    const featuredImage = imageMatch?.[1]?.trim();

    const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    let match: RegExpExecArray | null;
    const cleanParas: string[] = [];

    const noiseKeywords = [
      'Copyright', 'DNPA', 'Code of Conduct', 'All Rights Reserved',
      'Follow Us', 'Subscribe', 'Statutory provisions',
    ];

    while ((match = pRegex.exec(html)) !== null) {
      let text = match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

      if (text.includes('कॉपी लिंक')) {
        const parts = text.split('कॉपी लिंक');
        text = parts[parts.length - 1].trim();
      }

      const isNoise = noiseKeywords.some(kw => text.includes(kw));
      if (text.length > 25 && !isNoise) {
        cleanParas.push(`<p>${text}</p>`);
      }
    }

    return {
      content: cleanParas.join('\n\n'),
      featuredImage: featuredImage && featuredImage.startsWith('http') ? featuredImage : undefined,
    };
  } catch (err) {
    console.warn('[FullArticleExtractor] Error fetching full article text:', err);
  }
  return { content: '' };
}
