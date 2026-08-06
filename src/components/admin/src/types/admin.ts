export type UserRole = 'superadmin' | 'admin' | 'editor';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar: string | null;
  role: UserRole;
  created_at: string;
}

export type BlogStatus = 'draft' | 'published' | 'scheduled';

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  category_id: string | null;
  author_id: string;
  reading_time: string;
  views: number;
  featured: boolean;
  status: BlogStatus;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  og_image: string | null;
  published_at: string | null;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: string;
  description: string | null;
  created_at: string;
  blog_count?: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  blog_count?: number;
}

export interface BlogTag {
  blog_id: string;
  tag_id: string;
}

export interface Comment {
  id: string;
  blog_id: string;
  name: string;
  email: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  created_at: string;
  blog_title?: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribed_at: string;
}

export interface SystemSettings {
  website_name: string;
  logo: string | null;
  favicon: string | null;
  footer_text: string | null;
  social_links: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
    youtube?: string;
  };
  seo_default_title: string | null;
  seo_default_description: string | null;
  google_analytics_id: string | null;
  comment_moderation_enabled: boolean;
  newsletter_welcome_subject: string | null;
  maintenance_mode: boolean;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string | null;
  user_id: string;
  user_name?: string;
  created_at: string;
}

export interface MediaFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_modified: string;
  metadata: {
    size: number;
    mimetype: string;
  };
  publicUrl: string;
}
