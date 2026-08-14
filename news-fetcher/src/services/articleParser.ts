import { RawDiscoveredArticle } from '../types/news';

export function cleanText(input?: string): string {
  if (!input) return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ') // Strip HTML tags for clean text
    .replace(/\s+/g, ' ')
    .trim();
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
  const rawExcerpt = cleanText(raw.excerpt);
  const rawContent = cleanText(raw.content || raw.excerpt);

  const excerpt = rawExcerpt.length > 20
    ? rawExcerpt
    : (rawContent.length > 150 ? rawContent.substring(0, 150) + '...' : rawContent);

  // Wrap content into readable paragraph format if plain text
  let formattedContent = raw.content || `<p>${rawContent || excerpt}</p>`;
  if (!formattedContent.includes('<p>')) {
    formattedContent = `<p>${formattedContent}</p>`;
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
  if (cleanTitle.includes('पुलिस') || cleanTitle.includes('क्राइम') || cleanTitle.includes('हादसा')) autoTags.push('Crime');
  if (cleanTitle.includes('प्रशासन') || cleanTitle.includes('कलेक्टर') || cleanTitle.includes('चुनाव')) autoTags.push('Politics');
  if (cleanTitle.includes('स्कूल') || cleanTitle.includes('परीक्षा') || cleanTitle.includes('शिक्षा')) autoTags.push('Education');
  if (cleanTitle.includes('व्यापार') || cleanTitle.includes('बाजार')) autoTags.push('Business');
  if (videoUrl) autoTags.push('Video');

  const featuredImage = raw.featuredImage || galleryImages[0] || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200';

  const seoTitle = `${cleanTitle} | ${sourceName} Jalore News`;
  const seoDescription = excerpt.slice(0, 160);
  const seoKeywords = Array.from(new Set([...autoTags, 'Jalore Breaking News', 'Dainik Bhaskar Jalore', 'Jalore Local News']));

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
