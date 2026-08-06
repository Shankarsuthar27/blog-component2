import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentServices } from '../lib/supabase/services';
import { activityLogServices } from '../lib/supabase/services';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import type { Comment } from '../types/admin';

const QUERY_KEY = 'comments';

export function useComments() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: commentServices.getAll,
  });
}

export function useUpdateCommentStatus() {
  const qc = useQueryClient();
  const { profile } = useAuthStore();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Comment['status'] }) =>
      commentServices.updateStatus(id, status),
    onSuccess: async (_, { status }) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success(`Comment marked as ${status}`);
      if (profile) {
        await activityLogServices.log(
          `${status.toUpperCase()}_COMMENT`,
          `Comment status set to ${status}`,
          profile.id
        );
      }
    },
    onError: (err: any) => toast.error(`Failed: ${err.message}`),
  });
}

export function useDeleteComment() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => commentServices.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Comment deleted');
    },
    onError: (err: any) => toast.error(`Failed: ${err.message}`),
  });
}
