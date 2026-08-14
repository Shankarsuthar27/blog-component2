export type AgentRequestStatus = 'pending' | 'approved' | 'rejected';
export type AgentStatus = 'active' | 'suspended' | 'removed';

export interface AgentRequest {
  id: string;
  user_id?: string | null;
  full_name: string;
  email: string;
  phone: string;
  profile_photo?: string | null;
  city: string;
  district: string;
  state: string;
  address?: string | null;
  locality?: string | null;
  news_category?: string | null;
  experience?: string | null;
  motivation?: string | null;
  social_profile?: string | null;
  document_url?: string | null;
  status: AgentRequestStatus;
  rejection_reason?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Agent {
  id: string;
  user_id: string;
  agent_id: string; // e.g. AGT-0001
  full_name: string;
  email: string;
  phone: string;
  avatar_url?: string | null;
  city?: string | null;
  district?: string | null;
  state?: string | null;
  address?: string | null;
  category?: string | null;
  bio?: string | null;
  status: AgentStatus;
  referral_code: string; // e.g. AGT1024
  joined_at: string;
  created_at: string;
  updated_at?: string;
  permissions?: AgentPermissions;
}

export interface AgentPermissions {
  id?: string;
  agent_id?: string;
  create_article: boolean;
  edit_article: boolean;
  delete_article: boolean;
  upload_media: boolean;
  submit_article: boolean;
  publish_article: boolean;
  edit_published_article: boolean;
  view_analytics: boolean;
  manage_profile: boolean;
  manage_referrals: boolean;
}

export interface AgentReferral {
  id: string;
  agent_id: string;
  referred_user_id?: string | null;
  referral_code: string;
  status: 'pending' | 'verified' | 'rewarded';
  created_at: string;
  verified_at?: string | null;
  referred_name?: string;
  referred_email?: string;
}

export interface AgentNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}
