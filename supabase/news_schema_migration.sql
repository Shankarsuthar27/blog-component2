-- ============================================================
-- MIGRATION: Add missing columns to existing news_articles table
-- Run this in Supabase SQL Editor if you already created the
-- table without all columns (fixes PGRST204 errors on insert).
-- Safe to run multiple times (uses IF NOT EXISTS).
-- ============================================================

-- Add columns that may be missing from an older table version
alter table public.news_articles
  add column if not exists summary text,
  add column if not exists subcategory text,
  add column if not exists location text default 'Jalore, Rajasthan',
  add column if not exists author text default 'Dainik Bhaskar',
  add column if not exists video_url text,
  add column if not exists gallery_images text[] default '{}',
  add column if not exists is_featured boolean default false,
  add column if not exists views integer default 0,
  add column if not exists tags text[] default '{}',
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists seo_keywords text[] default '{}',
  add column if not exists content_hash text,
  add column if not exists updated_at timestamptz default now();

-- Reload the Supabase schema cache so PostgREST picks up new columns
notify pgrst, 'reload schema';

select 'Migration applied successfully. All columns now exist.' as result;
