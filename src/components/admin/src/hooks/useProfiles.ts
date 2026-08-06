import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileServices } from '../lib/supabase/services';
import { supabase } from '../lib/supabase/client';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import type { Profile } from '../types/admin';

const QUERY_KEY = 'profiles';

export function useProfiles() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: profileServices.getAll,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  const { profile, setProfile } = useAuthStore();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Profile> }) =>
      profileServices.update(id, updates),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      // Update auth store if own profile changed
      if (profile && updated.id === profile.id) {
        setProfile(updated);
      }
      toast.success('Profile updated!');
    },
    onError: (err: any) => toast.error(`Failed: ${err.message}`),
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: Profile['role'] }) =>
      profileServices.updateRole(id, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('User role updated');
    },
    onError: (err: any) => toast.error(`Failed: ${err.message}`),
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (newPassword: string) =>
      supabase.auth.updateUser({ password: newPassword }),
    onSuccess: () => toast.success('Password changed successfully!'),
    onError: (err: any) => toast.error(`Failed: ${err.message}`),
  });
}
