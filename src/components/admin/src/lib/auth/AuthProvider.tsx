import React, { useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../supabase/client';
import { useAuthStore } from '../../store/authStore';
import type { Profile } from '../../types/admin';

interface Props {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const { setSession } = useAuthStore();

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      useAuthStore.setState({ isLoading: false });
      return;
    }

    // Initialize session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id).then((profile) => {
          setSession(session, session.user, profile);
        });
      } else {
        const currentStore = useAuthStore.getState();
        if (!currentStore.session) {
          useAuthStore.setState({ isLoading: false });
        }
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          const profile = await fetchProfile(session.user.id);
          setSession(session, session.user, profile);
        } else {
          // Only clear session if not using an active mock/admin session
          const currentStore = useAuthStore.getState();
          if (!currentStore.isMock) {
            setSession(null, null, null);
          } else {
            useAuthStore.setState({ isLoading: false });
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setSession]);

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) return data as Profile;

      // If no profile found in DB (e.g. trigger hasn't run yet), create one
      const user = (await supabase.auth.getUser()).data.user;
      const newProfile: Partial<Profile> = {
        id: userId,
        email: user?.email || 'admin@insightjournal.com',
        full_name: user?.user_metadata?.full_name || 'Admin User',
        role: 'superadmin',
      };

      const { data: created } = await supabase
        .from('profiles')
        .upsert([newProfile], { onConflict: 'id' })
        .select()
        .single();

      return (created as Profile) || {
        id: userId,
        email: user?.email || 'admin@insightjournal.com',
        full_name: 'Daily Bharat Admin',
        avatar: null,
        role: 'superadmin',
        created_at: new Date().toISOString()
      };
    } catch (e) {
      console.warn('Failed to fetch/create profile in Supabase:', e);
      return {
        id: userId,
        email: 'admin@insightjournal.com',
        full_name: 'Daily Bharat Admin',
        avatar: null,
        role: 'superadmin',
        created_at: new Date().toISOString()
      };
    }
  };

  return <>{children}</>;
};
