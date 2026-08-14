export type NewsStatus = 'pending' | 'approved' | 'rejected' | 'published';

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  summary?: string | null;
  category?: string | null;
  subcategory?: string | null;
  location?: string | null;
  author?: string | null;
  featured_image?: string | null;
  video_url?: string | null;
  gallery_images?: string[] | null;
  source_name: string;
  source_url: string;
  source_published_at?: string | null;
  imported_at: string;
  published_at?: string | null;
  status: NewsStatus;
  is_featured: boolean;
  views: number;
  tags?: string[] | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string[] | null;
  content_hash?: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewsImportLog {
  id: string;
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
  created_at: string;
}

export interface NewsImportStats {
  totalFetched: number;
  pending: number;
  approved: number;
  published: number;
  rejected: number;
  duplicates: number;
  lastSyncTime: string | null;
  nextSyncTime?: string | null;
  isSyncing?: boolean;
  intervalMinutes?: number;
  autoPublishEnabled?: boolean;
  lastSyncResult?: {
    discovered: number;
    imported: number;
    duplicates: number;
    failed: number;
    message: string;
    timestamp?: string;
  } | null;
}

export interface NewsSyncResult {
  success: boolean;
  discovered: number;
  imported: number;
  duplicates: number;
  failed: number;
  message: string;
  durationMs?: number;
  timestamp?: string;
  logs?: NewsImportLog[];
}
