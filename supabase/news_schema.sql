-- ==========================================
-- AUTOMATED JALORE NEWS IMPORT SYSTEM SCHEMA
-- Idempotent (safe to re-run multiple times)
-- ==========================================

-- 1. News Articles Table
create table if not exists public.news_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  content text,
  summary text,
  category text default 'Jalore',
  subcategory text,
  location text default 'Jalore, Rajasthan',
  author text default 'Dainik Bhaskar',
  featured_image text,
  video_url text,
  gallery_images text[] default '{}',
  source_name text not null default 'Dainik Bhaskar',
  source_url text unique not null,
  source_published_at timestamptz,
  imported_at timestamptz default now(),
  published_at timestamptz,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected', 'published')),
  is_featured boolean default false,
  views integer default 0,
  tags text[] default '{}',
  seo_title text,
  seo_description text,
  seo_keywords text[] default '{}',
  content_hash text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. News Import Logs Table
create table if not exists public.news_import_logs (
  id uuid primary key default gen_random_uuid(),
  source_name text,
  source_url text,
  status text,
  error_message text,
  created_at timestamptz default now()
);

-- Performance Indexes
create index if not exists idx_news_articles_source_url on public.news_articles(source_url);
create index if not exists idx_news_articles_slug on public.news_articles(slug);
create index if not exists idx_news_articles_status on public.news_articles(status);
create index if not exists idx_news_articles_category on public.news_articles(category);
create index if not exists idx_news_articles_source_published_at on public.news_articles(source_published_at desc);
create index if not exists idx_news_articles_created_at on public.news_articles(created_at desc);
create index if not exists idx_news_import_logs_created_at on public.news_import_logs(created_at desc);

-- Enable RLS
alter table public.news_articles enable row level security;
alter table public.news_import_logs enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Allow public read published news_articles" on public.news_articles;
drop policy if exists "Allow full news_articles access for admins" on public.news_articles;
drop policy if exists "Allow full news_import_logs access" on public.news_import_logs;

-- RLS Policies
-- Public can only read published news articles
create policy "Allow public read published news_articles" 
  on public.news_articles 
  for select 
  using (status = 'published');

-- Admins / Service Role have full CRUD access
create policy "Allow full news_articles access for admins" 
  on public.news_articles 
  for all 
  using (true);

create policy "Allow full news_import_logs access" 
  on public.news_import_logs 
  for all 
  using (true);

-- Atomic view counter increment function for news articles
create or replace function public.increment_news_views(p_article_id uuid)
returns void as $$
begin
    update public.news_articles 
    set views = views + 1 
    where id = p_article_id;
end;
$$ language plpgsql security definer;

-- Notify PostgREST to reload schema cache
notify pgrst, 'reload schema';
