export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar: string | null;
          role: string;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          avatar?: string | null;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          avatar?: string | null;
          role?: string;
          created_at?: string;
        };
      };
      blogs: {
        Row: {
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
          status: string;
          seo_title: string | null;
          seo_description: string | null;
          canonical_url: string | null;
          og_image: string | null;
          published_at: string | null;
          scheduled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt?: string;
          content: string;
          featured_image?: string | null;
          category_id?: string | null;
          author_id: string;
          reading_time?: string;
          views?: number;
          featured?: boolean;
          status?: string;
          seo_title?: string | null;
          seo_description?: string | null;
          canonical_url?: string | null;
          og_image?: string | null;
          published_at?: string | null;
          scheduled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          excerpt?: string;
          content?: string;
          featured_image?: string | null;
          category_id?: string | null;
          author_id?: string;
          reading_time?: string;
          views?: number;
          featured?: boolean;
          status?: string;
          seo_title?: string | null;
          seo_description?: string | null;
          canonical_url?: string | null;
          og_image?: string | null;
          published_at?: string | null;
          scheduled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          color: string;
          icon: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          color?: string;
          icon?: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          color?: string;
          icon?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
        };
      };
      blog_tags: {
        Row: {
          blog_id: string;
          tag_id: string;
        };
        Insert: {
          blog_id: string;
          tag_id: string;
        };
        Update: {
          blog_id?: string;
          tag_id?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          blog_id: string;
          name: string;
          email: string;
          comment: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          blog_id: string;
          name: string;
          email: string;
          comment: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          blog_id?: string;
          name?: string;
          email?: string;
          comment?: string;
          status?: string;
          created_at?: string;
        };
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          subscribed_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          subscribed_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          subscribed_at?: string;
        };
      };
      settings: {
        Row: {
          key: string;
          value: Json;
        };
        Insert: {
          key: string;
          value: Json;
        };
        Update: {
          key?: string;
          value?: Json;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          action: string;
          details: string | null;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          action: string;
          details?: string | null;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          action?: string;
          details?: string | null;
          user_id?: string;
          created_at?: string;
        };
      };
      news_articles: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          content: string | null;
          summary: string | null;
          category: string | null;
          subcategory: string | null;
          location: string | null;
          author: string | null;
          featured_image: string | null;
          source_name: string;
          source_url: string;
          source_published_at: string | null;
          imported_at: string;
          published_at: string | null;
          status: string;
          is_featured: boolean;
          views: number;
          tags: string[] | null;
          seo_title: string | null;
          seo_description: string | null;
          seo_keywords: string[] | null;
          content_hash: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
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
          source_name?: string;
          source_url: string;
          source_published_at?: string | null;
          imported_at?: string;
          published_at?: string | null;
          status?: string;
          is_featured?: boolean;
          views?: number;
          tags?: string[] | null;
          seo_title?: string | null;
          seo_description?: string | null;
          seo_keywords?: string[] | null;
          content_hash?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          excerpt?: string | null;
          content?: string | null;
          summary?: string | null;
          category?: string | null;
          subcategory?: string | null;
          location?: string | null;
          author?: string | null;
          featured_image?: string | null;
          source_name?: string;
          source_url?: string;
          source_published_at?: string | null;
          imported_at?: string;
          published_at?: string | null;
          status?: string;
          is_featured?: boolean;
          views?: number;
          tags?: string[] | null;
          seo_title?: string | null;
          seo_description?: string | null;
          seo_keywords?: string[] | null;
          content_hash?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      news_import_logs: {
        Row: {
          id: string;
          source_name: string | null;
          source_url: string | null;
          status: string | null;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          source_name?: string | null;
          source_url?: string | null;
          status?: string | null;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          source_name?: string | null;
          source_url?: string | null;
          status?: string | null;
          error_message?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

