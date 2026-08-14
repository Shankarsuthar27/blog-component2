export type NewsStatus = 'pending' | 'approved' | 'rejected' | 'published';

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

export interface SyncPipelineResult {
  discovered: number;
  imported: number;
  duplicates: number;
  failed: number;
  message: string;
  durationMs: number;
  timestamp: string;
}

export interface NewsImportLogEntry {
  id?: string;
  source_name?: string | null;
  source_url?: string | null;
  status: string;
  discovered_count?: number;
  imported_count?: number;
  duplicate_count?: number;
  failed_count?: number;
  duration_ms?: number;
  triggered_by?: 'scheduler' | 'manual';
  error_message?: string | null;
  created_at?: string;
}
