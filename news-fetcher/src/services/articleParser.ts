import { RawDiscoveredArticle } from '../types/news';

/**
 * Strip ALL scripts, styles, HTML tags, then collapse whitespace.
 * Also removes residual JavaScript code that wasn't inside tags.
 */
export function cleanText(input?: string): string {
  if (!input) return '';
  let text = input
    // Remove entire script/style/noscript blocks first
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
    // Strip all remaining HTML tags
    .replace(/<[^>]+>/g, ' ')
    // Remove JS-like token sequences: function declarations, variable assignments, etc.
    .replace(/\bfunction\s*\([^)]*\)\s*\{[^}]*\}/gs, ' ')
    .replace(/\b(?:var|const|let)\s+\w[\w$]*\s*=.+?;/gs, ' ')
    .replace(/\bgoogletag\.[\s\S]*?;/g, ' ')
    .replace(/window\.[\w.]+\s*=[\s\S]*?;/g, ' ')
    .replace(/document\.\w+[\s\S]*?;/g, ' ')
    // Remove HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    // Remove lingering noise tokens
    .replace(/\b\d+:\d+\s+Play\s+video\b/gi, '')
    .replace(/Play video/gi, '')
    .replace(/Link Copied/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text;
}

/**
 * Noise patterns that appear in descriptions but are NOT real article content.
 * These are app-download banners, reaction widgets, ad slots, share buttons, etc.
 */
const NOISE_STARTS = [
  'फ्री ई-पेपर', 'पर्सनलाइज़्ड', 'लॉयल्टी रिवॉर्ड्स', 'AI Summary', 'मुख्य बातें',
  'खबरें लगातार', 'एप डाउनलोड', 'रहें हर खबर', 'Hindi News App',
  'अपनी प्रतिक्रिया', 'Stickers Emojis', 'Link Copied', 'Copyright',
  'DNPA', 'All Rights Reserved', 'Subscribe', 'Follow Us',
  'function ', 'var ', 'const ', 'let ', 'googletag', 'window.',
  'document.', '$(', 'if(', 'if (', 'else{', 'setTimeout',
  'मेरा शहर', 'होम राजस्थान', 'गूगल में',
];

/**
 * Detects if a text block looks like JavaScript, CSS, or ad-network code.
 */
function isCodeLike(text: string): boolean {
  // Code-punctuation density: { } ( ) ; = makes up > 5% of chars → JS/CSS
  const codeChars = (text.match(/[{}();=]/g) || []).length;
  if (codeChars / text.length > 0.05) return true;

  const codeKeywords = [
    /\bfunction\s*\(/, /\bvar\s+\w/, /\bconst\s+\w/, /\blet\s+\w/,
    /googletag\./, /window\.\w+/, /document\.\w/, /\$\s*\(['"]/,
    /localStorage\./, /sessionStorage\./, /navigator\./, /setTimeout\s*\(/,
    /addEventListener\s*\(/, /innerHTML\s*=/, /className\s*=/,
    /@keyframes/, /background-color\s*:/, /font-size\s*:/, /z-index\s*:/,
    /display\s*:\s*(?:none|block|flex)/, /dataLayer\.push/,
  ];
  return codeKeywords.some(p => p.test(text));
}

/**
 * Extracts a clean, human-readable description (≤250 chars) from the article
 * body content.  It splits the body into sentences and picks the first one
 * that is genuine news text (no JS, no noise).
 */
export function extractCleanExcerpt(rawContent: string, fallback: string, maxLen = 250): string {
  if (!rawContent) return fallback.slice(0, maxLen);

  // Strip HTML tags to get plain text
  const plain = cleanText(rawContent);

  // Split into candidate sentences by common Hindi/English terminators
  const sentences = plain
    .split(/(?<=[।\.!?])\s+|\n+/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 800);

  for (const sentence of sentences) {
    // Skip noise starters
    const isNoise = NOISE_STARTS.some(n => sentence.startsWith(n) || sentence.includes(n.slice(0, 20)));
    if (isNoise) continue;
    // Skip code-like sentences
    if (isCodeLike(sentence)) continue;
    // Skip sentences that are mostly ASCII punctuation/numbers (JS fragments)
    const hindiOrLetterChars = (sentence.match(/[\u0900-\u097Fa-zA-Z]/g) || []).length;
    if (hindiOrLetterChars / sentence.length < 0.4) continue;

    // Found a clean sentence — trim to maxLen
    return sentence.length > maxLen ? sentence.slice(0, maxLen) + '...' : sentence;
  }

  // Fallback: use first 250 chars of cleaned plain text if no clean sentence found
  const trimmed = plain.slice(0, maxLen);
  return trimmed.length > 20 ? trimmed : fallback.slice(0, maxLen);
}

/**
 * Sanitizes the HTML content body before storing:
 * removes <p> blocks that look like JavaScript/CSS and keeps only real prose.
 */
export function sanitizeContentHtml(html: string): string {
  if (!html) return '';
  // Remove script/style/noscript blocks completely
  let clean = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '');

  // Filter out <p> blocks that contain code-like text
  clean = clean.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (match, inner) => {
    const plain = inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (plain.length < 10) return '';
    if (plain.length > 1500) return ''; // definitely a JS blob
    if (isCodeLike(plain)) return '';
    const isNoise = NOISE_STARTS.some(n => plain.startsWith(n));
    if (isNoise) return '';
    return match;
  });

  return clean.trim();
}

export function parseAndFormatArticle(raw: RawDiscoveredArticle): {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  location: string;
  author: string;
  featuredImage: string;
  videoUrl?: string;
  galleryImages: string[];
  sourceName: string;
  sourceUrl: string;
  sourcePublishedAt: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
} {
  const cleanTitle = cleanText(raw.title) || 'जालोर समाचार';

  // Sanitize the HTML body content — removes code-like <p> blocks
  const sanitizedContent = sanitizeContentHtml(raw.content || '');

  // Build excerpt: extract first clean, human-readable sentence from the body
  const excerpt = extractCleanExcerpt(
    sanitizedContent || raw.excerpt || '',
    cleanTitle,
    250
  );

  // Wrap plain text into paragraph HTML if needed
  let formattedContent = sanitizedContent || `<p>${excerpt}</p>`;
  if (!formattedContent.includes('<p>')) {
    formattedContent = formattedContent
      .split(/\n+/)
      .filter(s => s.trim().length > 0)
      .map(s => `<p>${s.trim()}</p>`)
      .join('\n');
  }

  // Categories & Tags detection
  const category = raw.category || 'Jalore';
  const location = raw.location || 'Jalore, Rajasthan';
  const author = raw.author || raw.sourceName || 'Dainik Bhaskar';
  const sourceName = raw.sourceName || 'Dainik Bhaskar';
  const sourceUrl = raw.sourceUrl;
  const sourcePublishedAt = raw.sourcePublishedAt || new Date().toISOString();

  // Extract video URL if present in raw HTML/content
  let videoUrl = raw.videoUrl;
  if (!videoUrl && raw.content) {
    const iframeMatch = /<iframe[^>]+src=["']([^"']+)["']/i.exec(raw.content);
    const videoMatch = /<video[^>]+src=["']([^"']+)["']/i.exec(raw.content);
    videoUrl = iframeMatch?.[1] || videoMatch?.[1];
  }

  // Extract gallery images from content <img> tags if available
  const galleryImages: string[] = raw.galleryImages ? [...raw.galleryImages] : [];
  if (raw.content) {
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
    let match: RegExpExecArray | null;
    while ((match = imgRegex.exec(raw.content)) !== null) {
      if (match[1] && !galleryImages.includes(match[1])) {
        galleryImages.push(match[1]);
      }
    }
  }

  // Extract tags from title & content
  const autoTags: string[] = ['Jalore', 'Rajasthan', 'Jalore News'];
  if (cleanTitle.includes('बारिश') || cleanTitle.includes('मौसम')) autoTags.push('Weather');
  if (cleanTitle.includes('पुलिस') || cleanTitle.includes('क्राइम') || cleanTitle.includes('हादसा') || cleanTitle.includes('गिरफ्तार')) autoTags.push('Crime');
  if (cleanTitle.includes('प्रशासन') || cleanTitle.includes('कलेक्टर') || cleanTitle.includes('चुनाव') || cleanTitle.includes('पार्षद') || cleanTitle.includes('सरपंच')) autoTags.push('Politics');
  if (cleanTitle.includes('स्कूल') || cleanTitle.includes('परीक्षा') || cleanTitle.includes('शिक्षा') || cleanTitle.includes('कॉलेज')) autoTags.push('Education');
  if (cleanTitle.includes('व्यापार') || cleanTitle.includes('बाजार') || cleanTitle.includes('मंडी')) autoTags.push('Business');
  if (videoUrl) autoTags.push('Video');

  const featuredImage = raw.featuredImage || galleryImages[0] || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200';

  const seoTitle = `${cleanTitle} | ${sourceName} जालोर समाचार`;
  const seoDescription = excerpt.slice(0, 160);
  const seoKeywords = Array.from(new Set([...autoTags, 'Jalore Breaking News', 'Dainik Bhaskar Jalore', 'जालोर ताज़ा ख़बर', 'Rajasthan News']));

  return {
    title: cleanTitle,
    excerpt,
    content: formattedContent,
    category,
    location,
    author,
    featuredImage,
    videoUrl,
    galleryImages,
    sourceName,
    sourceUrl,
    sourcePublishedAt,
    tags: Array.from(new Set(autoTags)),
    seoTitle,
    seoDescription,
    seoKeywords,
  };
}
