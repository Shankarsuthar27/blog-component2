import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { newsletterServices } from '../lib/supabase/services';
import toast from 'react-hot-toast';

const QUERY_KEY = 'newsletter_subscribers';

export function useNewsletter() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: newsletterServices.getAll,
  });
}

export function useDeleteSubscriber() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, email }: { id: string; email: string }) =>
      newsletterServices.delete(id).then(() => ({ email })),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Subscriber removed');
    },
    onError: (err: any) => toast.error(`Failed: ${err.message}`),
  });
}
