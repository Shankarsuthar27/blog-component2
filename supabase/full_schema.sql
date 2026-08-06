-- ==========================================
-- DAILY BHARAT COMPLETE SUPABASE SCHEMA
-- Idempotent (safe to re-run multiple times)
-- ==========================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (Extends Supabase Auth users)
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null,
    full_name text,
    avatar text,
    role text default 'superadmin' check (role in ('superadmin', 'editor', 'author')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Categories Table
create table if not exists public.categories (
    id uuid primary key default uuid_generate_v4(),
    name text not null unique,
    slug text not null unique,
    description text,
    color text default '#D80408',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Blogs Table
create table if not exists public.blogs (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    slug text not null unique,
    excerpt text,
    content text not null,
    featured_image text,
    category_id uuid references public.categories(id) on delete set null,
    author_id uuid references public.profiles(id) on delete set null,
    status text default 'draft' check (status in ('draft', 'published', 'scheduled', 'archived')),
    featured boolean default false,
    seo_title text,
    seo_description text,
    reading_time text default '5 min read',
    views integer default 0,
    published_at timestamp with time zone,
    scheduled_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Tags Table
create table if not exists public.tags (
    id uuid primary key default uuid_generate_v4(),
    name text not null unique,
    slug text not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Blog Tags Junction Table
create table if not exists public.blog_tags (
    blog_id uuid references public.blogs(id) on delete cascade,
    tag_id uuid references public.tags(id) on delete cascade,
    primary key (blog_id, tag_id)
);

-- 6. Comments Table
create table if not exists public.comments (
    id uuid primary key default uuid_generate_v4(),
    blog_id uuid references public.blogs(id) on delete cascade,
    name text not null,
    email text not null,
    comment text not null,
    status text default 'pending' check (status in ('pending', 'approved', 'spam', 'trash')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Newsletter Subscribers Table
create table if not exists public.newsletter_subscribers (
    id uuid primary key default uuid_generate_v4(),
    email text not null unique,
    status text default 'subscribed' check (status in ('subscribed', 'unsubscribed')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Settings Table
create table if not exists public.settings (
    key text primary key,
    value jsonb not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Activity Logs Table
create table if not exists public.activity_logs (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete set null,
    action text not null,
    details text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Contact Messages Table
create table if not exists public.contact_messages (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    email text not null,
    subject text,
    message text not null,
    read boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. Blog Analytics & Views Tracking
create table if not exists public.blog_views (
    id uuid primary key default uuid_generate_v4(),
    blog_id uuid references public.blogs(id) on delete cascade,
    viewed_at date default current_date,
    view_count integer default 1,
    unique(blog_id, viewed_at)
);

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.blogs enable row level security;
alter table public.tags enable row level security;
alter table public.blog_tags enable row level security;
alter table public.comments enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.settings enable row level security;
alter table public.activity_logs enable row level security;
alter table public.contact_messages enable row level security;
alter table public.blog_views enable row level security;

-- Drop existing policies if re-running to avoid duplicate policy errors (ERROR 42710)
drop policy if exists "Allow public profiles read access" on public.profiles;
drop policy if exists "Allow profile owner updating" on public.profiles;
drop policy if exists "Allow public categories read access" on public.categories;
drop policy if exists "Allow all write categories" on public.categories;
drop policy if exists "Allow public read published blogs" on public.blogs;
drop policy if exists "Allow full blog access" on public.blogs;
drop policy if exists "Allow public tags read access" on public.tags;
drop policy if exists "Allow tags write access" on public.tags;
drop policy if exists "Allow public blog_tags read access" on public.blog_tags;
drop policy if exists "Allow blog_tags write access" on public.blog_tags;
drop policy if exists "Allow public comment creation" on public.comments;
drop policy if exists "Allow comment updating" on public.comments;
drop policy if exists "Allow public newsletter subscription" on public.newsletter_subscribers;
drop policy if exists "Allow newsletter select" on public.newsletter_subscribers;
drop policy if exists "Allow public settings read access" on public.settings;
drop policy if exists "Allow settings update" on public.settings;
drop policy if exists "Allow activity read" on public.activity_logs;
drop policy if exists "Allow activity write" on public.activity_logs;
drop policy if exists "Allow contact insert" on public.contact_messages;
drop policy if exists "Allow contact all" on public.contact_messages;
drop policy if exists "Allow blog_views all" on public.blog_views;
drop policy if exists "Public Access to media bucket" on storage.objects;
drop policy if exists "Public Upload to media bucket" on storage.objects;
drop policy if exists "Public Update in media bucket" on storage.objects;
drop policy if exists "Public Delete in media bucket" on storage.objects;

-- Permissive RLS policies for web and admin operations
create policy "Allow public profiles read access" on public.profiles for select using (true);
create policy "Allow profile owner updating" on public.profiles for all using (true);

create policy "Allow public categories read access" on public.categories for select using (true);
create policy "Allow all write categories" on public.categories for all using (true);

create policy "Allow public read published blogs" on public.blogs for select using (true);
create policy "Allow full blog access" on public.blogs for all using (true);

create policy "Allow public tags read access" on public.tags for select using (true);
create policy "Allow tags write access" on public.tags for all using (true);

create policy "Allow public blog_tags read access" on public.blog_tags for select using (true);
create policy "Allow blog_tags write access" on public.blog_tags for all using (true);

create policy "Allow public comment creation" on public.comments for select using (true);
create policy "Allow comment updating" on public.comments for all using (true);

create policy "Allow public newsletter subscription" on public.newsletter_subscribers for select using (true);
create policy "Allow newsletter select" on public.newsletter_subscribers for all using (true);

create policy "Allow public settings read access" on public.settings for select using (true);
create policy "Allow settings update" on public.settings for all using (true);

create policy "Allow activity read" on public.activity_logs for select using (true);
create policy "Allow activity write" on public.activity_logs for all using (true);

create policy "Allow contact insert" on public.contact_messages for insert with check (true);
create policy "Allow contact all" on public.contact_messages for all using (true);

create policy "Allow blog_views all" on public.blog_views for all using (true);

-- Performance Indexes
create index if not exists idx_blogs_slug on public.blogs(slug);
create index if not exists idx_blogs_status on public.blogs(status);
create index if not exists idx_blogs_published_at on public.blogs(published_at desc);
create index if not exists idx_blogs_category_id on public.blogs(category_id);
create index if not exists idx_blogs_author_id on public.blogs(author_id);
create index if not exists idx_comments_blog_id on public.comments(blog_id);
create index if not exists idx_activity_logs_created_at on public.activity_logs(created_at desc);

-- Functions
create or replace function public.increment_blog_views(p_blog_id uuid)
returns void as $$
begin
    update public.blogs set views = views + 1 where id = p_blog_id;
    insert into public.blog_views (blog_id, viewed_at, view_count)
    values (p_blog_id, current_date, 1)
    on conflict (blog_id, viewed_at) 
    do update set view_count = public.blog_views.view_count + 1;
end;
$$ language plpgsql security definer;

create or replace function public.log_activity(p_action text, p_details text, p_user_id uuid default null)
returns void as $$
begin
    insert into public.activity_logs (action, details, user_id)
    values (p_action, p_details, p_user_id);
end;
$$ language plpgsql security definer;

-- Automatic Profile Creation trigger from Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, email, full_name, role)
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', 'Insight Contributor'),
        'superadmin'
    ) on conflict (id) do nothing;
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- Seed Default Settings
insert into public.settings (key, value) values
    ('website_name', '"Daily Bharat"'),
    ('footer_text', '"© 2026 Daily Bharat. All rights reserved."'),
    ('seo_default_title', '"Daily Bharat — Modern Tech & News Platform"'),
    ('seo_default_description', '"High-quality technical guides, web architectures, and daily inspirations."'),
    ('comment_moderation_enabled', 'true'),
    ('maintenance_mode', 'false'),
    ('social_links', '{"facebook": "", "twitter": "", "instagram": "", "linkedin": "", "github": ""}')
on conflict (key) do nothing;

-- Supabase Storage Bucket Initialization ('media')
insert into storage.buckets (id, name, public) 
values ('media', 'media', true) 
on conflict (id) do update set public = true;

-- Storage RLS Policies for 'media' bucket
create policy "Public Access to media bucket" on storage.objects 
    for select using (bucket_id = 'media');

create policy "Public Upload to media bucket" on storage.objects 
    for insert with check (bucket_id = 'media');

create policy "Public Update in media bucket" on storage.objects 
    for update using (bucket_id = 'media');

create policy "Public Delete in media bucket" on storage.objects 
    for delete using (bucket_id = 'media');

-- Notify PostgREST to reload schema cache
notify pgrst, 'reload schema';
