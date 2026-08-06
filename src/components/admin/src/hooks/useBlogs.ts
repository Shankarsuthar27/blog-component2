import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogServices } from '../lib/supabase/services';
import { activityLogServices } from '../lib/supabase/services';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import type { Blog } from '../types/admin';

const QUERY_KEY = 'blogs';

export function useBlogs() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: blogServices.getAll,
  });
}

export function useBlog(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => blogServices.getById(id!),
    enabled: !!id,
  });
}

export function useBlogTagIds(blogId: string | undefined) {
  return useQuery({
    queryKey: ['blog_tags', blogId],
    queryFn: () => blogServices.getTagIds(blogId!),
    enabled: !!blogId,
  });
}

export function useCreateBlog() {
  const qc = useQueryClient();
  const { profile } = useAuthStore();

  return useMutation({
    mutationFn: ({ blog, tagIds }: { blog: Partial<Blog>; tagIds: string[] }) =>
      blogServices.create({ ...blog, author_id: profile?.id }, tagIds),
    onSuccess: async (data) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Article created successfully!');
      if (profile) {
        await activityLogServices.log(
          'CREATE_BLOG',
          `Created article: "${data.title}"`,
          profile.id
        );
      }
    },
    onError: (err: any) => toast.error(`Failed to create: ${err.message}`),
  });
}

export function useUpdateBlog() {
  const qc = useQueryClient();
  const { profile } = useAuthStore();

  return useMutation({
    mutationFn: ({ id, blog, tagIds }: { id: string; blog: Partial<Blog>; tagIds: string[] }) =>
      blogServices.update(id, blog, tagIds),
    onSuccess: async (data) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Article updated successfully!');
      if (profile) {
        await activityLogServices.log(
          data.status === 'published' ? 'PUBLISH_BLOG' : 'UPDATE_BLOG',
          `${data.status === 'published' ? 'Published' : 'Updated'} article: "${data.title}"`,
          profile.id
        );
      }
    },
    onError: (err: any) => toast.error(`Failed to update: ${err.message}`),
  });
}

export function useDeleteBlog() {
  const qc = useQueryClient();
  const { profile } = useAuthStore();

  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      blogServices.delete(id).then(() => ({ title })),
    onSuccess: async (_, { title }) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Article deleted');
      if (profile) {
        await activityLogServices.log('DELETE_BLOG', `Deleted article: "${title}"`, profile.id);
      }
    },
    onError: (err: any) => toast.error(`Failed to delete: ${err.message}`),
  });
}

export function useDuplicateBlog() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (blog: Blog) => blogServices.duplicate(blog),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Article duplicated successfully!');
    },
    onError: (err: any) => toast.error(`Failed to duplicate: ${err.message}`),
  });
}
