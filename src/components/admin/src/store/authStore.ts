import { create } from 'zustand';
import type { Profile } from '../types/admin';

interface AuthState {
  user: any | null;
  profile: Profile | null;
  session: any | null;
  isLoading: boolean;
  isMock: boolean;
  setSession: (session: any, user: any, profile: Profile | null) => void;
  setProfile: (profile: Profile | null) => void;
  loginAdminSession: (email: string) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  isMock: false,

  setSession: (session, user, profile) => set({
    session,
    user,
    profile,
    isLoading: false,
    isMock: false,
  }),

  setProfile: (profile) => set({ profile }),

  loginAdminSession: (email: string) => {
    const adminProfile: Profile = {
      id: 'admin-2233-id',
      email,
      full_name: 'Admin 2233',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
      role: 'superadmin',
      created_at: new Date().toISOString()
    };
    set({
      user: { id: 'admin-2233-id', email },
      profile: adminProfile,
      session: { access_token: 'admin-access-token', user: { id: 'admin-2233-id', email } },
      isLoading: false,
      isMock: true,
    });
  },

  logout: async () => {
    // Dynamically import to avoid circular deps
    const { supabase } = await import('../lib/supabase/client');
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // Ignore if no active Supabase session
    }
    set({ user: null, profile: null, session: null, isLoading: false, isMock: false });
  },
}));
