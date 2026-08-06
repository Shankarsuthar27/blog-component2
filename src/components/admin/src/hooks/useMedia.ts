import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storageServices } from '../lib/supabase/storage';
import toast from 'react-hot-toast';

const QUERY_KEY = 'media';
const FOLDER = 'uploads';

export function useMedia() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => storageServices.list(FOLDER),
  });
}

export function useUploadMedia() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      onProgress,
    }: {
      file: File;
      onProgress?: (pct: number) => void;
    }) => storageServices.upload(file, FOLDER, onProgress),
    onSuccess: (url) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('File uploaded successfully!');
      return url;
    },
    onError: (err: any) => toast.error(`Upload failed: ${err.message}`),
  });
}

export function useDeleteMedia() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (fullPath: string) => storageServices.delete(fullPath),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('File deleted');
    },
    onError: (err: any) => toast.error(`Delete failed: ${err.message}`),
  });
}
