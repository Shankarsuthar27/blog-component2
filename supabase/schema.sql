-- SUPABASE DATABASE CONFIGURATION SCHEMA

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (Auth metadata binds)
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text not null unique,
    full_name text not null,
    avatar text,
    role text not null default 'editor' check (role in ('superadmin', 'admin', 'editor')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Categories Table
create table public.categories (
    id uuid default uuid_generate_v4() primary key,
    name text not null unique,
    slug text not null unique,
    color text not null default '#06b6d4',
    icon text not null default 'Cpu',
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Blogs Table
create table public.blogs (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    slug text not null unique,
    excerpt text not null,
    content text not null,
    featured_image text,
    category_id uuid references public.categories(id) on delete set null,
    author_id uuid references public.profiles(id) on delete cascade not null,
    reading_time text not null default '1 min read',
    views integer default 0 not null,
    featured boolean default false not null,
    status text not null default 'draft' check (status in ('draft', 'published', 'scheduled')),
    seo_title text,
    seo_description text,
    canonical_url text,
    og_image text,
    published_at timestamp with time zone,
    scheduled_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Tags Table
create table public.tags (
    id uuid default uuid_generate_v4() primary key,
    name text not null unique,
    slug text not null unique
);

-- 5. Blog Tags Junction table
create table public.blog_tags (
    blog_id uuid references public.blogs(id) on delete cascade,
    tag_id uuid references public.tags(id) on delete cascade,
    primary key (blog_id, tag_id)
);

-- 6. Comments Table
create table public.comments (
    id uuid default uuid_generate_v4() primary key,
    blog_id uuid references public.blogs(id) on delete cascade not null,
    name text not null,
    email text not null,
    comment text not null,
    status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'spam')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Newsletter Subscribers Table
create table public.newsletter_subscribers (
    id uuid default uuid_generate_v4() primary key,
    email text not null unique,
    subscribed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. General Settings Table
create table public.settings (
    key text primary key,
    value jsonb not null
);

-- 9. Activity Logs Table
create table public.activity_logs (
    id uuid default uuid_generate_v4() primary key,
    action text not null,
    details text,
    user_id uuid references public.profiles(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Policies Configuration
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.blogs enable row level security;
alter table public.tags enable row level security;
alter table public.blog_tags enable row level security;
alter table public.comments enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.settings enable row level security;
alter table public.activity_logs enable row level security;

-- Setup Admin Policies
create policy "Allow public profiles read access" on public.profiles for select using (true);
create policy "Allow profile owner updating" on public.profiles for update using (auth.uid() = id);

create policy "Allow public categories read access" on public.categories for select using (true);
create policy "Allow admin write categories" on public.categories for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'superadmin'))
);

create policy "Allow public read published blogs" on public.blogs for select using (status = 'published');
create policy "Allow admin full blog access" on public.blogs for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'superadmin', 'editor'))
);

create policy "Allow public tags read access" on public.tags for select using (true);
create policy "Allow admin tags write access" on public.tags for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'superadmin'))
);

create policy "Allow public blog_tags read access" on public.blog_tags for select using (true);
create policy "Allow admin blog_tags write access" on public.blog_tags for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'superadmin', 'editor'))
);

create policy "Allow public comment creation" on public.comments for insert with check (true);
create policy "Allow admin comment updating" on public.comments for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'superadmin'))
);

create policy "Allow public newsletter subscription" on public.newsletter_subscribers for insert with check (true);
create policy "Allow admin newsletter select" on public.newsletter_subscribers for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'superadmin'))
);

create policy "Allow public settings read access" on public.settings for select using (true);
create policy "Allow admin settings update" on public.settings for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'superadmin')
);

create policy "Allow admin activity read" on public.activity_logs for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'superadmin'))
);

-- Automatic UpdatedAt Trigger Function
create or replace function public.set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger set_blogs_updated_at
    before update on public.blogs
    for each row execute function public.set_updated_at();

-- Automatic Profile Creation trigger from Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, email, full_name, role)
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', 'Insight Contributor'),
        'editor' -- Default role to verify credentials
    );
    return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();
