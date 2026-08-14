export interface RawDiscoveredArticle {
  title: string;
  sourceUrl: string;
  sourceName: string;
  sourcePublishedAt?: string;
  excerpt?: string;
  content?: string;
  featuredImage?: string;
  videoUrl?: string;
  galleryImages?: string[];
  category?: string;
  location?: string;
  author?: string;
}

export interface NormalizedNewsArticle {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  summary: string;
  category: string;
  subcategory?: string;
  location: string;
  author: string;
  featuredImage?: string;
  videoUrl?: string;
  galleryImages?: string[];
  sourceName: string;
  sourceUrl: string;
  sourcePublishedAt?: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  contentHash: string;
}

export interface NewsSourceAdapter {
  name: string;
  baseUrl: string;
  targetUrl: string;
  fetchLatestNews(): Promise<RawDiscoveredArticle[]>;
}
