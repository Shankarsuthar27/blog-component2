/**
 * Fetches a news article page and extracts clean article data:
 * - Title (from og:title or h1)
 * - High-res featured image (og:image)
 * - Clean article body paragraphs (NO JavaScript, CSS, or ad code)
 * - Published date
 */
export async function extractFullArticleDetails(url: string): Promise<{
  title?: string;
  content: string;
  featuredImage?: string;
  publishedAt?: string;
}> {
  if (!url || !url.startsWith('http')) return { content: '' };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 InsightJournalNewsImporter/1.0',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) return { content: '' };
    const rawHtml = await res.text();

    // ─── STEP 1: Nuke ALL script/style/noscript blocks from the full HTML ────
    // This must happen BEFORE any regex extracts content from <p> tags,
    // otherwise JS code inside or near paragraphs leaks into article text.
    const html = rawHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, ''); // remove HTML comments too

    // ─── STEP 2: Title — og:title → twitter:title → h1 ────────────────────────
    let title: string | undefined;

    const ogTitleMatch =
      html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
    if (ogTitleMatch?.[1]) {
      title = decodeHtmlEntities(ogTitleMatch[1].trim());
    }

    if (!title) {
      const twTitleMatch =
        html.match(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i) ||
        html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:title["']/i);
      if (twTitleMatch?.[1]) title = decodeHtmlEntities(twTitleMatch[1].trim());
    }

    if (!title) {
      const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      if (h1Match?.[1]) {
        title = h1Match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      }
    }

    if (title) {
      title = title
        .replace(/\b\d+:\d+\s+Play\s+video\b/gi, '')
        .replace(/Play video/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    // ─── STEP 3: Featured image ────────────────────────────────────────────────
    const imageMatch =
      html.match(/<meta[^>]+(?:property=["']og:image["']|name=["']twitter:image["']|itemprop=["']image["'])[^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property=["']og:image["']|name=["']twitter:image["']|itemprop=["']image["'])/i);
    const featuredImage = imageMatch?.[1]?.trim();

    // ─── STEP 4: Published date ────────────────────────────────────────────────
    let publishedAt: string | undefined;
    const dateMatch =
      html.match(/<meta[^>]+(?:property=["']article:published_time["']|name=["']pubdate["']|itemprop=["']datePublished["'])[^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property=["']article:published_time["']|name=["']pubdate["']|itemprop=["']datePublished["'])/i);
    if (dateMatch?.[1]) {
      publishedAt = new Date(dateMatch[1]).toISOString();
    } else {
      const jsonLdBlocks = html.match(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
      // Note: the big script-strip above removed inline scripts, so we re-scan rawHtml for ld+json only
      const rawJsonLd = rawHtml.match(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
      if (rawJsonLd) {
        for (const block of rawJsonLd) {
          const jsonText = block.replace(/<script[^>]*>|<\/script>/gi, '').trim();
          try {
            const data = JSON.parse(jsonText);
            const pubDate =
              data.datePublished ||
              data.dateModified ||
              (Array.isArray(data['@graph'])
                ? data['@graph'].find((g: any) => g.datePublished)?.datePublished
                : undefined);
            if (pubDate) { publishedAt = new Date(pubDate).toISOString(); break; }
          } catch { /* ignore malformed ld+json */ }
        }
      }
    }

    // ─── STEP 5: Clean article body paragraphs ────────────────────────────────
    const noiseStrings = [
      'Copyright', 'DNPA', 'Code of Conduct', 'All Rights Reserved',
      'Follow Us', 'Subscribe', 'Statutory provisions',
      'App Store', 'Google Play', 'डाउनलोड ऐप', 'कॉपी लिंक',
      'पढ़ें पूरी खबर', 'और पढ़ें', 'देखें वीडियो', 'Link Copied',
      'फ्री ई-पेपर', 'पर्सनलाइज़्ड', 'लॉयल्टी रिवॉर्ड्स',
      'AI Summary', 'मुख्य बातें',
      'खबरें लगातार पढ़ने के लिए', 'एप डाउनलोड करें',
      'रहें हर खबर से अपडेट', 'Hindi News App',
      'अपनी प्रतिक्रिया व्यक्त करें', 'Stickers Emojis',
    ];

    const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    let match: RegExpExecArray | null;
    const cleanParas: string[] = [];

    while ((match = pRegex.exec(html)) !== null) {
      let text = match[1]
        .replace(/<[^>]+>/g, ' ')   // strip any remaining inline tags
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Skip empty or very short fragments
      if (text.length < 30) continue;

      // Skip suspiciously long paragraphs (>1500 chars = almost certainly a JS blob)
      if (text.length > 1500) continue;

      // Skip paragraphs that look like JavaScript / ad code
      if (looksLikeCode(text)) continue;

      // Handle inline "कॉपी लिंक" button text bleeding into content
      if (text.includes('कॉपी लिंक')) {
        const parts = text.split('कॉपी लिंक');
        text = parts[parts.length - 1].trim();
        if (text.length < 30) continue;
      }

      // Skip known noise/boilerplate strings
      const isNoise = noiseStrings.some(kw => text.startsWith(kw) || text === kw);
      if (isNoise) continue;

      cleanParas.push(`<p>${text}</p>`);
    }

    return {
      title: title || undefined,
      content: cleanParas.length > 0 ? cleanParas.join('\n\n') : '',
      featuredImage: featuredImage && featuredImage.startsWith('http') ? featuredImage : undefined,
      publishedAt,
    };
  } catch (err) {
    console.warn(`[FullArticleExtractor] Error fetching article (${url}):`, err);
  }
  return { content: '' };
}

/**
 * Returns true if text looks like JavaScript, CSS, or ad-network code rather
 * than human-readable article content.  Used to reject code-like <p> blocks.
 */
function looksLikeCode(text: string): boolean {
  // Quick character-ratio test: code has lots of { } ( ) ; = characters
  const codeChars = (text.match(/[{};=()]/g) || []).length;
  const totalChars = text.length;
  if (codeChars / totalChars > 0.06) return true; // >6% code punctuation → likely JS/CSS

  // Keyword patterns that appear in JS but never in normal Hindi/English news text
  const codePatterns = [
    /\bfunction\s*\(/,
    /\bvar\s+\w+\s*=/,
    /\bconst\s+\w+\s*=/,
    /\blet\s+\w+\s*=/,
    /googletag\./,
    /window\.\w+\s*=/,
    /document\.\w+/,
    /\$\s*\(\s*['"`]/,           // jQuery selectors: $('...') or $("..")
    /\$\s*\.\w+\s*\(/,           // jQuery methods: $.ajax(
    /localStorage\./,
    /sessionStorage\./,
    /navigator\.\w+/,
    /setTimeout\s*\(/,
    /setInterval\s*\(/,
    /addEventListener\s*\(/,
    /querySelector\s*\(/,
    /innerHTML\s*=/,
    /className\s*=/,
    /\.push\s*\(\s*function/,
    /googletag\.cmd/,
    /window\._taboola/,
    /dataLayer\s*\./,
    /@keyframes/,
    /display\s*:\s*(?:none|block|flex)/,
    /background-color\s*:/,
    /font-size\s*:\s*\d/,
    /z-index\s*:/,
  ];

  return codePatterns.some(p => p.test(text));
}

/** Decode common HTML entities in meta tag content */
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}
