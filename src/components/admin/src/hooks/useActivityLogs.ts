import { useQuery } from '@tanstack/react-query';
import { activityLogServices } from '../lib/supabase/services';

const QUERY_KEY = 'activity_logs';

export function useActivityLogs() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: activityLogServices.getAll,
    refetchInterval: 30 * 1000, // Auto-refresh every 30s
  });
}
