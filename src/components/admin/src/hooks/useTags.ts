import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tagServices } from '../lib/supabase/services';
import toast from 'react-hot-toast';
import type { Tag } from '../types/admin';

const QUERY_KEY = 'tags';

export function useTags() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: tagServices.getAll,
  });
}

export function useCreateTag() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (tag: Partial<Tag>) => tagServices.create(tag),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Tag created!');
    },
    onError: (err: any) => {
      if (err.code === '23505') toast.error('Tag already exists');
      else toast.error(`Failed: ${err.message}`);
    },
  });
}

export function useUpdateTag() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, tag }: { id: string; tag: Partial<Tag> }) =>
      tagServices.update(id, tag),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Tag updated!');
    },
    onError: (err: any) => toast.error(`Failed: ${err.message}`),
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tagServices.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Tag deleted');
    },
    onError: (err: any) => toast.error(`Failed: ${err.message}`),
  });
}
