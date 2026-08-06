import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Trash2, Search, UploadCloud, Copy, Loader2 } from 'lucide-react';
import { useMedia, useUploadMedia, useDeleteMedia } from '../../hooks/useMedia';
import toast from 'react-hot-toast';

export const MediaLibraryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const { data: mediaItems = [], isLoading } = useMedia();
  const uploadMedia = useUploadMedia();
  const deleteMedia = useDeleteMedia();

  const onDrop = async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      const key = file.name;
      setUploadProgress((prev) => ({ ...prev, [key]: 0 }));
      await uploadMedia.mutateAsync({
        file,
        onProgress: (pct) => setUploadProgress((prev) => ({ ...prev, [key]: pct })),
      });
      setUploadProgress((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif'] },
    maxSize: 5 * 1024 * 1024,
    onDropRejected: (rejections) => {
      rejections.forEach((r) => {
        if (r.errors[0]?.code === 'file-too-large') {
          toast.error(`${r.file.name} exceeds 5MB limit`);
        } else {
          toast.error(`${r.file.name}: ${r.errors[0]?.message}`);
        }
      });
    },
  });

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Public URL copied to clipboard!');
  };

  const handleDelete = (fullPath: string, name: string) => {
    if (window.confirm(`Delete "${name}"?`)) {
      deleteMedia.mutate(fullPath);
    }
  };

  const filteredMedia = mediaItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const uploadsInProgress = Object.keys(uploadProgress);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">
          Media Library
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Store, filter, compress, and host cover assets and images in Supabase.
          {!isLoading && (
            <span className="ml-2 font-semibold text-cyan-600">{mediaItems.length} files</span>
          )}
        </p>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-3xl p-8 text-center flex flex-col items-center justify-center transition cursor-pointer ${
          isDragActive
            ? 'border-cyan-500 bg-cyan-50/20 text-cyan-500'
            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:border-cyan-500/50'
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud size={36} className="text-cyan-500 mb-2" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Drag & Drop images here, or click to browse files
        </p>
        <p className="text-[10px] text-slate-400 mt-1">Supports PNG, JPG, WEBP, AVIF up to 5MB</p>
      </div>

      {/* Upload Progress Indicators */}
      {uploadsInProgress.length > 0 && (
        <div className="space-y-2">
          {uploadsInProgress.map((fileName) => (
            <div key={fileName} className="flex items-center gap-3 bg-cyan-50 dark:bg-cyan-950/20 rounded-xl px-4 py-3">
              <Loader2 size={14} className="animate-spin text-cyan-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{fileName}</p>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1 mt-1">
                  <div
                    className="bg-cyan-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress[fileName] || 0}%` }}
                  />
                </div>
              </div>
              <span className="text-[10px] font-mono text-cyan-600 shrink-0">
                {uploadProgress[fileName] || 0}%
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          placeholder="Search media files by filename..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs focus:outline-none focus:border-cyan-500 transition shadow-sm"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-cyan-500" size={32} />
        </div>
      )}

      {/* Grid */}
      {!isLoading && filteredMedia.length === 0 && (
        <div className="text-center py-16 text-slate-400 text-sm">
          {mediaItems.length === 0
            ? 'No files uploaded yet. Drag & drop images above!'
            : 'No files match your search.'}
        </div>
      )}

      {!isLoading && filteredMedia.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col group relative hover:shadow-md transition"
            >
              {/* Visual preview */}
              <div className="aspect-video w-full overflow-hidden bg-slate-50 border-b border-slate-100 dark:border-slate-800 relative">
                <img src={item.url} alt="" className="w-full h-full object-cover" />

                {/* Overlay hover options */}
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition duration-200">
                  <button
                    onClick={() => handleCopyLink(item.url)}
                    className="w-8 h-8 rounded-lg bg-white text-slate-700 hover:text-cyan-500 flex items-center justify-center shadow transition cursor-pointer"
                    title="Copy Link"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.fullPath, item.name)}
                    disabled={deleteMedia.isPending}
                    className="w-8 h-8 rounded-lg bg-white text-slate-700 hover:text-red-500 flex items-center justify-center shadow transition cursor-pointer"
                    title="Delete File"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Info details */}
              <div className="p-4 min-w-0">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate leading-snug">
                  {item.name}
                </p>
                <div className="flex justify-between items-center mt-1.5 text-[9px] font-mono text-slate-400 dark:text-slate-500">
                  <span>{item.size}</span>
                  <span>{item.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default MediaLibraryPage;
