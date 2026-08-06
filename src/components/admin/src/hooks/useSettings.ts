import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsServices } from '../lib/supabase/services';
import { activityLogServices } from '../lib/supabase/services';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const QUERY_KEY = 'settings';

export function useSettings() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: settingsServices.getAll,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

export function useSaveSettings() {
  const qc = useQueryClient();
  const { profile } = useAuthStore();

  return useMutation({
    mutationFn: (settings: Record<string, any>) =>
      settingsServices.upsertMany(settings),
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Settings saved successfully!');
      if (profile) {
        await activityLogServices.log(
          'UPDATE_SETTINGS',
          'Modified website configuration',
          profile.id
        );
      }
    },
    onError: (err: any) => toast.error(`Failed to save: ${err.message}`),
  });
}
