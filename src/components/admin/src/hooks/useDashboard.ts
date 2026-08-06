import { useQuery } from '@tanstack/react-query';
import { dashboardServices } from '../lib/supabase/services';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard_stats'],
    queryFn: dashboardServices.getStats,
    refetchInterval: 60 * 1000, // Refresh every minute
  });
}

export function useDashboardViewTrend() {
  return useQuery({
    queryKey: ['dashboard_view_trend'],
    queryFn: dashboardServices.getViewTrend,
    staleTime: 5 * 60 * 1000,
  });
}
