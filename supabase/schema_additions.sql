-- SUPABASE SCHEMA ADDITIONS — run these in the Supabase SQL editor

-- ===================================================
-- 1. Add contact_messages table (missing from original)
-- ===================================================
create table if not exists public.contact_messages (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    email text not null,
    phone text,
    subject text not null,
    message text not null,
    is_read boolean default false not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.contact_messages enable row level security;

create policy "Allow public contact message insertion" 
    on public.contact_messages for insert with check (true);

create policy "Allow admin contact message management" 
    on public.contact_messages for all using (
        exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'superadmin'))
    );

-- ===================================================
-- 2. Add blog_views table (for daily analytics tracking)
-- ===================================================
create table if not exists public.blog_views (
    id uuid default gen_random_uuid() primary key,
    blog_id uuid references public.blogs(id) on delete cascade not null,
    viewed_at date default current_date not null,
    view_count integer default 1 not null,
    unique(blog_id, viewed_at)
);

alter table public.blog_views enable row level security;

create policy "Allow public blog views insert" 
    on public.blog_views for insert with check (true);

create policy "Allow public blog views read" 
    on public.blog_views for select using (true);

create policy "Allow public blog views update" 
    on public.blog_views for update using (true);

-- ===================================================
-- 3. Add indexes for performance
-- ===================================================
create index if not exists idx_blogs_slug on public.blogs(slug);
create index if not exists idx_blogs_status on public.blogs(status);
create index if not exists idx_blogs_published_at on public.blogs(published_at desc);
create index if not exists idx_blogs_category_id on public.blogs(category_id);
create index if not exists idx_blogs_author_id on public.blogs(author_id);
create index if not exists idx_blogs_featured on public.blogs(featured);
create index if not exists idx_comments_blog_id on public.comments(blog_id);
create index if not exists idx_comments_status on public.comments(status);
create index if not exists idx_activity_logs_user_id on public.activity_logs(user_id);
create index if not exists idx_activity_logs_created_at on public.activity_logs(created_at desc);
create index if not exists idx_blog_views_blog_id on public.blog_views(blog_id);

-- ===================================================
-- 4. Create Supabase Storage bucket for media (run separately if needed)
-- ===================================================
-- Insert into storage.buckets (id, name, public) values ('media', 'media', true);

-- ===================================================
-- 5. Storage RLS Policies for media bucket
-- ===================================================
-- create policy "Allow public media read"
--     on storage.objects for select using (bucket_id = 'media');

-- create policy "Allow admin media upload"
--     on storage.objects for insert with check (
--         bucket_id = 'media' and 
--         exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'superadmin', 'editor'))
--     );

-- create policy "Allow admin media delete"
--     on storage.objects for delete using (
--         bucket_id = 'media' and 
--         exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'superadmin'))
--     );

-- ===================================================
-- 6. Function to increment blog view count atomically
-- ===================================================
create or replace function public.increment_blog_views(p_blog_id uuid)
returns void as $$
begin
    -- Increment total views on blog
    update public.blogs set views = views + 1 where id = p_blog_id;
    -- Upsert daily views for analytics
    insert into public.blog_views (blog_id, viewed_at, view_count)
    values (p_blog_id, current_date, 1)
    on conflict (blog_id, viewed_at) 
    do update set view_count = public.blog_views.view_count + 1;
end;
$$ language plpgsql security definer;

-- ===================================================
-- 7. Function to log admin activity
-- ===================================================
create or replace function public.log_activity(p_action text, p_details text, p_user_id uuid)
returns void as $$
begin
    insert into public.activity_logs (action, details, user_id)
    values (p_action, p_details, p_user_id);
end;
$$ language plpgsql security definer;

-- ===================================================
-- 8. Allow editors to write activity logs
-- ===================================================
create policy "Allow authenticated activity log insert" 
    on public.activity_logs for insert with check (auth.uid() = user_id);

-- ===================================================
-- 9. Fix: Allow editors to read all blogs (not just published)
-- ===================================================
-- The original policy "Allow admin full blog access" uses FOR ALL which covers SELECT for logged-in users.
-- This is correct. Public users only see published.

-- ===================================================
-- 10. Default settings seed data
-- ===================================================
insert into public.settings (key, value) values
    ('website_name', '"Insight Journal"'),
    ('footer_text', '"© 2026 Insight Journal. All rights reserved."'),
    ('seo_default_title', '"Insight Journal — Modern Tech & Design Blog"'),
    ('seo_default_description', '"High-quality technical guides, web architectures, and premium UI/UX inspirations."'),
    ('comment_moderation_enabled', 'true'),
    ('maintenance_mode', 'false'),
    ('social_links', '{"facebook": "", "twitter": "", "instagram": "", "linkedin": "", "github": ""}')
on conflict (key) do nothing;
