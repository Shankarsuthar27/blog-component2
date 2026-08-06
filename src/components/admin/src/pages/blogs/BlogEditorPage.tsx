import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCategories } from '../../hooks/useCategories';
import { useTags } from '../../hooks/useTags';
import { useBlog, useBlogTagIds, useCreateBlog, useUpdateBlog } from '../../hooks/useBlogs';
import { useAuthStore } from '../../store/authStore';
import { slugify, calculateReadingTime } from '../../utils/helpers';
import { TipTapEditor } from '../../components/editor/TipTapEditor';
import { storageServices } from '../../lib/supabase/storage';
import {
  ArrowLeft, Save, Sparkles, AlertCircle, Hash, X, Upload, Loader2, ImagePlus, Trash2, Globe, FileText, FolderTree, Calendar, Copy, Check, Eye, ExternalLink, CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export const BlogEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const { profile } = useAuthStore();

  const { data: categories = [] } = useCategories();
  const { data: tags = [] } = useTags();
  const { data: existingBlog, isLoading: blogLoading } = useBlog(id);
  const { data: existingTagIds = [] } = useBlogTagIds(id);

  const createBlog = useCreateBlog();
  const updateBlog = useUpdateBlog();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [status, setStatus] = useState<'draft' | 'published' | 'scheduled'>('draft');
  const [featured, setFeatured] = useState(false);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState('1 min read');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [copiedSlug, setCopiedSlug] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Load existing blog data when editing
  useEffect(() => {
    if (isEditMode && existingBlog) {
      setTitle(existingBlog.title);
      setSlug(existingBlog.slug);
      setExcerpt(existingBlog.excerpt);
      setContent(existingBlog.content);
      setFeaturedImage(existingBlog.featured_image || '');
      setCategoryId(existingBlog.category_id || '');
      setStatus(existingBlog.status);
      setFeatured(existingBlog.featured);
      setSeoTitle(existingBlog.seo_title || '');
      setSeoDescription(existingBlog.seo_description || '');
      setScheduledAt(existingBlog.scheduled_at || '');
    }
  }, [existingBlog, isEditMode]);

  // Load tag IDs when editing
  useEffect(() => {
    if (isEditMode && existingTagIds.length > 0) {
      setSelectedTags(existingTagIds);
    }
  }, [existingTagIds, isEditMode]);

  // Reading time calculator
  useEffect(() => {
    const time = calculateReadingTime(content);
    setReadingTime(time);
  }, [content]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!isEditMode || !slug) {
      setSlug(slugify(val));
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    setUploadProgress(0);
    try {
      const url = await storageServices.upload(file, 'uploads', (pct) => setUploadProgress(pct));
      setFeaturedImage(url);
      toast.success('Cover image uploaded!');
    } catch (err: any) {
      toast.error(`Upload failed: ${err.message}`);
    } finally {
      setUploadingImage(false);
      setUploadProgress(0);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handleAiDescription = () => {
    if (!title.trim()) {
      toast.error('Please enter an article title first');
      return;
    }
    toast.success('AI generating SEO metadata & parameters...', { icon: '🤖' });
    setTimeout(() => {
      const cleanSlug = slugify(title);
      setSlug(cleanSlug);
      setSeoTitle(`${title} | Daily Bharat`);
      setSeoDescription(excerpt ? excerpt.slice(0, 155) : `Read the complete article on ${title} at Daily Bharat.`);
      toast.success('SEO & Slug parameters auto-filled!');
    }, 800);
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const copyFullUrl = () => {
    const fullUrl = `https://example.com/blog/${slug || 'article'}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(true);
    toast.success('URL copied to clipboard!');
    setTimeout(() => setCopiedSlug(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('Article title is required'); return; }
    if (!content.trim() || content === '<p></p>') { toast.error('Article story body is required'); return; }
    if (!profile) { toast.error('You must be logged in to post'); return; }

    const blogData = {
      title: title.trim(),
      slug: slug || slugify(title),
      excerpt: excerpt.trim(),
      content,
      featured_image: featuredImage || null,
      category_id: categoryId || null,
      status,
      featured,
      seo_title: seoTitle || null,
      seo_description: seoDescription || null,
      reading_time: readingTime,
      published_at: status === 'published' ? new Date().toISOString() : null,
      scheduled_at: status === 'scheduled' && scheduledAt ? scheduledAt : null,
    };

    if (isEditMode && id) {
      await updateBlog.mutateAsync({ id, blog: blogData, tagIds: selectedTags });
    } else {
      await createBlog.mutateAsync({ blog: blogData, tagIds: selectedTags });
    }
    navigate('/admin/blogs');
  };

  const isSaving = createBlog.isPending || updateBlog.isPending;

  // Publishing readiness checklist progress
  const checklist = [
    { label: 'Headline Title', done: !!title.trim() },
    { label: 'Story Body Content', done: !!content.trim() && content !== '<p></p>' },
    { label: 'Summary Excerpt', done: !!excerpt.trim() },
    { label: 'Cover Image', done: !!featuredImage },
    { label: 'Category Selected', done: !!categoryId },
    { label: 'SEO Metadata', done: !!seoTitle || !!seoDescription },
  ];
  const completedCount = checklist.filter((item) => item.done).length;
  const progressPercent = Math.round((completedCount / checklist.length) * 100);

  if (isEditMode && blogLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="animate-spin text-[#D80408]" size={32} />
      </div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSave}
      className="space-y-8 pb-12"
    >
      {/* Sticky Upper Control Header */}
      <div className="sticky top-[70px] z-20 py-4 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] dark:border-slate-800 px-2">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/blogs')}
            className="w-10 h-10 border border-[#E2E8F0] dark:border-slate-800 hover:bg-[#ECFEFF] dark:hover:bg-slate-800 rounded-2xl flex items-center justify-center text-[#64748B] hover:text-[#D80408] transition cursor-pointer shrink-0 shadow-2xs"
            title="Back to articles list"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#0F172A] dark:text-white leading-tight">
                {isEditMode ? 'Edit Article' : 'Write New Article'}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-[#ECFEFF] text-[#D80408] border border-[#CFFAFE]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D80408] animate-ping" />
                {status}
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5 flex items-center gap-2 font-medium">
              <span>Create and publish beautiful content</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Saved 2s ago</span>
            </p>
          </div>
        </div>

        {/* Action Buttons Header */}
        <div className="flex items-center gap-2.5">
          {slug && (
            <a
              href={`/blog/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 text-xs font-semibold text-[#64748B] hover:text-[#D80408] bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl flex items-center gap-1.5 transition shadow-2xs"
            >
              <Eye size={14} /> Preview
            </a>
          )}

          <button
            type="button"
            onClick={() => { setStatus('draft'); }}
            className="px-4 py-2 text-xs font-semibold text-[#0F172A] dark:text-white bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl hover:bg-[#F8FAFC] transition shadow-2xs cursor-pointer"
          >
            Save Draft
          </button>

          <button
            type="submit"
            disabled={isSaving}
            onClick={() => { if (status !== 'scheduled') setStatus('published'); }}
            className="bg-gradient-to-r from-[#D80408] to-[#0EA5E9] hover:opacity-95 disabled:opacity-60 text-white text-xs font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-[#D80408]/20 cursor-pointer transition"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isSaving ? 'Saving...' : isEditMode ? 'Update Article' : 'Publish Now'}
          </button>
        </div>
      </div>

      {/* Editor Body 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Main Writing Area (Left 8 Columns) */}
        <div className="lg:col-span-8 space-y-6">

          {/* Frameless Notion-Style Title Input Card */}
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xs">
            
            {/* Main Article Title Input */}
            <div>
              <input
                type="text"
                required
                value={title}
                onChange={handleTitleChange}
                placeholder="Enter article headline..."
                className="w-full text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#0F172A] dark:text-white border-none focus:outline-none focus:ring-0 bg-transparent placeholder-[#94A3B8] leading-tight"
              />
            </div>

            {/* Permanent URL Slug Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#F8FAFC] dark:bg-slate-900/60 rounded-xl border border-[#E2E8F0] dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 font-mono text-[#64748B] overflow-hidden min-w-0">
                <Globe size={14} className="text-[#D80408] shrink-0" />
                <span className="truncate">https://example.com/blog/<strong>{slug || 'url-slug'}</strong></span>
                {slug && <Check size={14} className="text-emerald-500 shrink-0" />}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={copyFullUrl}
                  className="px-2.5 py-1 text-[11px] font-semibold text-[#D80408] hover:bg-[#ECFEFF] rounded-lg transition border border-[#CFFAFE] flex items-center gap-1 cursor-pointer"
                >
                  {copiedSlug ? <Check size={12} /> : <Copy size={12} />}
                  {copiedSlug ? 'Copied' : 'Copy URL'}
                </button>
              </div>
            </div>

            {/* Summary Excerpt Textarea */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-[#0F172A] dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={14} className="text-[#D80408]" /> Summary Excerpt
                </label>
                <span className="text-[11px] text-[#64748B] font-mono">{excerpt.length} / 200 chars</span>
              </div>
              <textarea
                value={excerpt}
                maxLength={250}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Write a compelling summary that encourages readers to continue reading..."
                rows={3}
                className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-slate-800/60 text-sm text-[#0F172A] dark:text-slate-200 border border-[#E2E8F0] dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#D80408] focus:ring-2 focus:ring-[#D80408]/10 transition resize-none leading-relaxed placeholder-[#94A3B8]"
              />
            </div>
          </div>

          {/* TipTap Rich Text Story Content Editor */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-bold text-[#0F172A] dark:text-slate-200 uppercase tracking-wider">Story Body Content *</label>
              <span className="text-xs text-[#D80408] font-mono bg-[#ECFEFF] dark:bg-cyan-950/40 px-3 py-1 rounded-full font-bold border border-[#CFFAFE]">
                {wordCount} words · {readingTime}
              </span>
            </div>
            <TipTapEditor
              value={content}
              onChange={setContent}
              onWordCountChange={setWordCount}
              status={status}
            />
          </div>
        </div>

        {/* Right Publishing Sidebar (Right 4 Columns) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Publishing Checklist Readiness Card */}
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xs">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-[#0F172A] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-[#D80408]" /> Publishing Readiness
              </h3>
              <span className="text-xs font-bold text-[#D80408] font-mono">{progressPercent}%</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-[#F8FAFC] dark:bg-slate-800 rounded-full overflow-hidden border border-[#E2E8F0] dark:border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-[#D80408] to-[#0EA5E9] transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Checklist Items */}
            <div className="space-y-2 pt-1 text-xs">
              {checklist.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className={item.done ? 'text-[#0F172A] dark:text-slate-200 font-medium' : 'text-[#94A3B8]'}>
                    {item.label}
                  </span>
                  <span className={item.done ? 'text-emerald-500 font-bold' : 'text-[#94A3B8]'}>
                    {item.done ? '✓' : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cover Image Upload Card */}
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xs">
            <h3 className="text-xs font-bold text-[#0F172A] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <ImagePlus size={15} className="text-[#D80408]" /> Cover Image
            </h3>

            <div className="space-y-3">
              {/* URL Input */}
              <div className="relative">
                <input
                  type="text"
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  placeholder="Paste cover image URL..."
                  className="w-full pl-3 pr-8 py-2 bg-[#F8FAFC] dark:bg-slate-800/60 text-xs border border-[#E2E8F0] dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#D80408] transition truncate text-[#0F172A] dark:text-white"
                />
                {featuredImage && (
                  <button
                    type="button"
                    onClick={() => setFeaturedImage('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-red-500"
                    title="Clear image"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Upload Dropzone */}
              <div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="w-full py-4 border-2 border-dashed border-[#E2E8F0] dark:border-slate-700 hover:border-[#D80408] rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#D80408] flex flex-col items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-60 bg-[#F8FAFC] dark:bg-slate-800/40"
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-[#D80408]" />
                      <span>Uploading {uploadProgress}%...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={18} className="text-[#D80408]" />
                      <span className="font-bold text-[#0F172A] dark:text-white">Click or Drag & Drop Image</span>
                      <span className="text-[10px] text-[#94A3B8]">JPG, PNG, WebP supported</span>
                    </>
                  )}
                </button>
              </div>

              {/* Image Preview */}
              {featuredImage ? (
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 group">
                  <img src={featuredImage} alt="Cover preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-[#0F172A]/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white text-[#0F172A] rounded-xl text-xs font-bold shadow-md flex items-center gap-1 cursor-pointer hover:bg-slate-100"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeaturedImage('')}
                      className="px-3 py-1.5 bg-red-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="aspect-video w-full rounded-xl border-2 border-dashed border-[#E2E8F0] dark:border-slate-800 flex flex-col items-center justify-center text-[#94A3B8] text-[10px] font-medium p-4 text-center">
                  <AlertCircle size={18} className="mb-1 text-slate-300 dark:text-slate-600" />
                  Cover image preview
                </div>
              )}
            </div>
          </div>

          {/* Classification & Category Selector Card */}
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xs">
            <h3 className="text-xs font-bold text-[#0F172A] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <FolderTree size={15} className="text-[#D80408]" /> Category & Tags
            </h3>

            {/* Category Select */}
            <div>
              <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1.5">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-slate-800 text-xs border border-[#E2E8F0] dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#D80408] cursor-pointer text-[#0F172A] dark:text-white font-medium"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Tags Pills */}
            <div>
              <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1.5">Article Tags</label>
              <div className="flex flex-wrap gap-1.5 p-2 bg-[#F8FAFC] dark:bg-slate-800/40 rounded-xl max-h-36 overflow-y-auto border border-[#E2E8F0] dark:border-slate-800">
                {tags.length === 0 && (
                  <span className="text-[10px] text-[#94A3B8] p-1">No tags available.</span>
                )}
                {tags.map((tag) => {
                  const isSelected = selectedTags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 border transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#ECFEFF] text-[#D80408] border-[#CFFAFE] font-bold'
                          : 'bg-white dark:bg-slate-900 border-[#E2E8F0] dark:border-slate-700 text-[#475569] hover:border-[#D80408]/50'
                      }`}
                    >
                      <Hash size={10} />
                      {tag.name}
                      {isSelected && <X size={10} className="ml-0.5 text-[#D80408]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Featured Post Checkbox */}
            <div className="pt-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-[#0F172A] dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded border-[#E2E8F0] text-[#D80408] focus:ring-[#D80408]/20 w-4 h-4"
                />
                Mark as Featured Article
              </label>
            </div>
          </div>

          {/* Scheduled Date Picker */}
          {status === 'scheduled' && (
            <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-6 space-y-3 shadow-2xs">
              <h3 className="text-xs font-bold text-[#0F172A] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={15} className="text-[#D80408]" /> Publishing Schedule
              </h3>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-xs text-[#0F172A] dark:text-white focus:outline-none focus:border-[#D80408]"
              />
            </div>
          )}

          {/* SEO Metadata & Quality Card */}
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xs">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-[#0F172A] dark:text-white uppercase tracking-wider">SEO Metadata</h3>
              <button
                type="button"
                onClick={handleAiDescription}
                className="px-2.5 py-1 bg-[#ECFEFF] hover:bg-[#CFFAFE] text-[#D80408] text-[10px] font-bold rounded-lg flex items-center gap-1 transition cursor-pointer border border-[#CFFAFE]"
              >
                <Sparkles size={11} /> AI Auto-Fill
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1.5">Meta Title</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="SEO page title..."
                className="w-full px-3.5 py-2 bg-[#F8FAFC] dark:bg-slate-800/60 text-xs border border-[#E2E8F0] dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#D80408] transition text-[#0F172A] dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1.5">Meta Description</label>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="SEO search engine summary description..."
                rows={3}
                className="w-full px-3.5 py-2 bg-[#F8FAFC] dark:bg-slate-800/60 text-xs border border-[#E2E8F0] dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#D80408] transition resize-none text-[#0F172A] dark:text-white"
              />
            </div>
          </div>

        </div>
      </div>
    </motion.form>
  );
};
export default BlogEditorPage;
