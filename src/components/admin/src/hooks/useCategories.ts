import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryServices } from '../lib/supabase/services';
import { activityLogServices } from '../lib/supabase/services';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import type { Category } from '../types/admin';

const QUERY_KEY = 'categories';

export function useCategories() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: categoryServices.getAll,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  const { profile } = useAuthStore();

  return useMutation({
    mutationFn: (cat: Partial<Category>) => categoryServices.create(cat),
    onSuccess: async (data) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Category created successfully!');
      if (profile) {
        await activityLogServices.log(
          'CREATE_CATEGORY',
          `Created category: "${data.name}"`,
          profile.id
        );
      }
    },
    onError: (err: any) => {
      if (err.code === '23505') toast.error('Category name already exists');
      else toast.error(`Failed: ${err.message}`);
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, cat }: { id: string; cat: Partial<Category> }) =>
      categoryServices.update(id, cat),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Category updated!');
    },
    onError: (err: any) => toast.error(`Failed: ${err.message}`),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  const { profile } = useAuthStore();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      categoryServices.delete(id).then(() => ({ name })),
    onSuccess: async (_, { name }) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Category deleted');
      if (profile) {
        await activityLogServices.log('DELETE_CATEGORY', `Deleted category: "${name}"`, profile.id);
      }
    },
    onError: (err: any) => toast.error(`Failed: ${err.message}`),
  });
}
