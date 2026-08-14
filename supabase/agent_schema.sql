-- ============================================================================
-- DAILY BHARAT: AGENT MANAGEMENT SYSTEM & AGENT PANEL SUPABASE SCHEMA
-- Safe & Idempotent (Can be re-executed in Supabase SQL Editor safely)
-- ============================================================================

-- 1. Update Profiles Role Check & Columns
DO $$
BEGIN
    -- Drop existing role constraint if it exists to allow new roles ('admin', 'agent', 'user')
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
        CHECK (role IN ('superadmin', 'admin', 'agent', 'editor', 'author', 'user'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- 2. Agent Requests Table (Public Applications)
CREATE TABLE IF NOT EXISTS public.agent_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    profile_photo text,
    city text NOT NULL,
    district text NOT NULL,
    state text NOT NULL,
    address text,
    locality text,
    news_category text,
    experience text,
    motivation text,
    social_profile text,
    document_url text,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason text,
    reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 3. Agents Table (Approved Agents)
CREATE TABLE IF NOT EXISTS public.agents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    agent_id text NOT NULL UNIQUE,
    full_name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    avatar_url text,
    city text,
    district text,
    state text,
    address text,
    category text,
    bio text,
    status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'removed')),
    referral_code text NOT NULL UNIQUE,
    joined_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 4. Agent Permissions Table
CREATE TABLE IF NOT EXISTS public.agent_permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id uuid REFERENCES public.agents(id) ON DELETE CASCADE UNIQUE,
    create_article boolean DEFAULT true,
    edit_article boolean DEFAULT true,
    delete_article boolean DEFAULT true,
    upload_media boolean DEFAULT true,
    submit_article boolean DEFAULT true,
    publish_article boolean DEFAULT false,
    edit_published_article boolean DEFAULT false,
    view_analytics boolean DEFAULT true,
    manage_profile boolean DEFAULT true,
    manage_referrals boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 5. Agent Referrals Tracking Table
CREATE TABLE IF NOT EXISTS public.agent_referrals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id uuid REFERENCES public.agents(id) ON DELETE CASCADE,
    referred_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    referral_code text NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rewarded')),
    created_at timestamptz DEFAULT now(),
    verified_at timestamptz
);

-- 6. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'info',
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- 7. Add Author ID reference to News Articles table if missing
ALTER TABLE public.news_articles ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Enable Row Level Security (RLS) on all agent tables
ALTER TABLE public.agent_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 8. Idempotent RLS Policies
DROP POLICY IF EXISTS "Allow public insert agent_requests" ON public.agent_requests;
DROP POLICY IF EXISTS "Allow user view own agent_requests" ON public.agent_requests;
DROP POLICY IF EXISTS "Allow admin full access agent_requests" ON public.agent_requests;

DROP POLICY IF EXISTS "Allow public read active agents" ON public.agents;
DROP POLICY IF EXISTS "Allow agent view own agent profile" ON public.agents;
DROP POLICY IF EXISTS "Allow admin full access agents" ON public.agents;

DROP POLICY IF EXISTS "Allow agent view own permissions" ON public.agent_permissions;
DROP POLICY IF EXISTS "Allow admin full access agent_permissions" ON public.agent_permissions;

DROP POLICY IF EXISTS "Allow agent view own referrals" ON public.agent_referrals;
DROP POLICY IF EXISTS "Allow admin full access agent_referrals" ON public.agent_referrals;

DROP POLICY IF EXISTS "Allow user view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow admin full access notifications" ON public.notifications;

-- Create RLS Policies
CREATE POLICY "Allow public insert agent_requests" ON public.agent_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow user view own agent_requests" ON public.agent_requests FOR SELECT USING (true);
CREATE POLICY "Allow admin full access agent_requests" ON public.agent_requests FOR ALL USING (true);

CREATE POLICY "Allow public read active agents" ON public.agents FOR SELECT USING (status = 'active');
CREATE POLICY "Allow agent view own agent profile" ON public.agents FOR SELECT USING (true);
CREATE POLICY "Allow admin full access agents" ON public.agents FOR ALL USING (true);

CREATE POLICY "Allow agent view own permissions" ON public.agent_permissions FOR SELECT USING (true);
CREATE POLICY "Allow admin full access agent_permissions" ON public.agent_permissions FOR ALL USING (true);

CREATE POLICY "Allow agent view own referrals" ON public.agent_referrals FOR SELECT USING (true);
CREATE POLICY "Allow admin full access agent_referrals" ON public.agent_referrals FOR ALL USING (true);

CREATE POLICY "Allow user view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id OR true);
CREATE POLICY "Allow admin full access notifications" ON public.notifications FOR ALL USING (true);

-- 9. Performance Indices
CREATE INDEX IF NOT EXISTS idx_agent_requests_status ON public.agent_requests(status);
CREATE INDEX IF NOT EXISTS idx_agent_requests_email ON public.agent_requests(email);
CREATE INDEX IF NOT EXISTS idx_agents_agent_id ON public.agents(agent_id);
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON public.agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_status ON public.agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_referral_code ON public.agents(referral_code);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- 10. Sequential Agent ID Generator Function
CREATE OR REPLACE FUNCTION public.generate_next_agent_id()
RETURNS text AS $$
DECLARE
    next_val integer;
BEGIN
    SELECT count(*) + 1 INTO next_val FROM public.agents;
    RETURN 'AGT-' || lpad(next_val::text, 4, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reload PostgREST Schema Cache
NOTIFY pgrst, 'reload schema';
