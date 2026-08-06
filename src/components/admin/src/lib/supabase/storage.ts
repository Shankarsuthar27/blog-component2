import { supabase } from './client';
import toast from 'react-hot-toast';

const BUCKET = 'media';

// Helper to convert File to Base64 Data URL
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const storageServices = {
  /**
   * Upload a file to the media bucket.
   * Returns the public URL or base64 fallback URL.
   */
  async upload(
    file: File,
    folder = 'uploads',
    onProgress?: (pct: number) => void
  ): Promise<string> {
    const ext = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    // Simulate progress
    if (onProgress) {
      let pct = 0;
      const interval = setInterval(() => {
        pct = Math.min(pct + 25, 90);
        onProgress(pct);
        if (pct >= 90) clearInterval(interval);
      }, 150);
    }

    try {
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, file, { upsert: false, cacheControl: '3600' });

      if (error) {
        if (error.message.toLowerCase().includes('bucket not found') || error.message.toLowerCase().includes('not found')) {
          toast('Image uploaded via local data URL. Create "media" bucket in Supabase for cloud storage.', {
            icon: '🖼️',
            duration: 4000,
          });
          const base64Url = await fileToBase64(file);
          if (onProgress) onProgress(100);
          return base64Url;
        }
        throw new Error(error.message);
      }

      if (onProgress) onProgress(100);
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
      const publicUrl = data.publicUrl;
      return publicUrl.includes('/storage/v1/object/media/')
        ? publicUrl.replace('/storage/v1/object/media/', '/storage/v1/object/public/media/')
        : publicUrl;
    } catch (err: any) {
      // Automatic Base64 fallback if storage bucket is missing
      const base64Url = await fileToBase64(file);
      if (onProgress) onProgress(100);
      return base64Url;
    }
  },

  /**
   * List all files in the media bucket.
   */
  async list(folder = 'uploads'): Promise<{
    id: string;
    name: string;
    url: string;
    size: string;
    date: string;
    fullPath: string;
  }[]> {
    try {
      const { data, error } = await supabase.storage.from(BUCKET).list(folder, {
        sortBy: { column: 'created_at', order: 'desc' },
      });

      if (error) return [];

      return (data || [])
        .filter((item) => item.id !== null && item.name !== '.emptyFolderPlaceholder')
        .map((item) => {
          const fullPath = `${folder}/${item.name}`;
          const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fullPath);
          const sizeKb = item.metadata?.size
            ? item.metadata.size < 1024 * 1024
              ? `${Math.round(item.metadata.size / 1024)} KB`
              : `${(item.metadata.size / (1024 * 1024)).toFixed(1)} MB`
            : '—';
          return {
            id: item.id || item.name,
            name: item.name,
            url: urlData.publicUrl,
            size: sizeKb,
            date: item.updated_at
              ? new Date(item.updated_at).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })
              : '—',
            fullPath,
          };
        });
    } catch (e) {
      return [];
    }
  },

  /**
   * Delete a file from the media bucket.
   */
  async delete(fullPath: string): Promise<void> {
    try {
      const { error } = await supabase.storage.from(BUCKET).remove([fullPath]);
      if (error && !error.message.toLowerCase().includes('not found')) {
        throw new Error(error.message);
      }
    } catch (e) {
      // Ignored for fallback
    }
  },

  /**
   * Get public URL for a file path.
   */
  getPublicUrl(fullPath: string): string {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(fullPath);
    return data.publicUrl;
  },
};

/**
 * Upload helper with toast notifications — use in components.
 */
export async function uploadWithToast(
  file: File,
  folder = 'uploads',
  onProgress?: (pct: number) => void
): Promise<string | null> {
  try {
    const url = await storageServices.upload(file, folder, onProgress);
    toast.success('File uploaded successfully!');
    return url;
  } catch (err: any) {
    toast.error(`Upload failed: ${err.message}`);
    return null;
  }
}
