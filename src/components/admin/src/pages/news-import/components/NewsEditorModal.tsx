import React, { useState } from 'react';
import { X, Save, CheckCircle2, XCircle, ExternalLink, Sparkles } from 'lucide-react';
import type { NewsArticle, NewsStatus } from '../../../../../../types/news';

interface NewsEditorModalProps {
  article: NewsArticle;
  onClose: () => void;
  onSave: (updatedArticle: Partial<NewsArticle>, targetStatus?: NewsStatus) => Promise<void>;
}

export const NewsEditorModal: React.FC<NewsEditorModalProps> = ({
  article,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(article.title || '');
  const [slug, setSlug] = useState(article.slug || '');
  const [excerpt, setExcerpt] = useState(article.excerpt || '');
  const [summary, setSummary] = useState(article.summary || '');
  const [content, setContent] = useState(article.content || '');
  const [category, setCategory] = useState(article.category || 'Jalore');
  const [location, setLocation] = useState(article.location || 'Jalore, Rajasthan');
  const [author, setAuthor] = useState(article.author || 'Dainik Bhaskar');
  const [featuredImage, setFeaturedImage] = useState(article.featured_image || '');
  const [videoUrl, setVideoUrl] = useState(article.video_url || '');
  const [galleryImages, setGalleryImages] = useState((article.gallery_images || []).join(', '));
  const [tags, setTags] = useState((article.tags || []).join(', '));
  const [seoTitle, setSeoTitle] = useState(article.seo_title || '');
  const [seoDescription, setSeoDescription] = useState(article.seo_description || '');
  const [seoKeywords, setSeoKeywords] = useState((article.seo_keywords || []).join(', '));
  const [sourceName, setSourceName] = useState(article.source_name || 'Dainik Bhaskar');
  const [sourceUrl, setSourceUrl] = useState(article.source_url || '');

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (targetStatus?: NewsStatus) => {
    setIsSaving(true);
    try {
      const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
      const keywordList = seoKeywords.split(',').map((k) => k.trim()).filter(Boolean);
      const galleryList = galleryImages.split(',').map((img) => img.trim()).filter(Boolean);

      await onSave(
        {
          id: article.id,
          title,
          slug,
          excerpt,
          summary,
          content,
          category,
          location,
          author,
          featured_image: featuredImage,
          video_url: videoUrl,
          gallery_images: galleryList,
          tags: tagList,
          seo_title: seoTitle,
          seo_description: seoDescription,
          seo_keywords: keywordList,
          source_name: sourceName,
          source_url: sourceUrl,
          ...(targetStatus ? { status: targetStatus } : {}),
          ...(targetStatus === 'published' ? { published_at: new Date().toISOString() } : {}),
        },
        targetStatus
      );
      onClose();
    } catch (e) {
      console.error('Error saving news article:', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] my-8 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="text-[#0891B2]" size={20} />
              Review & Edit Imported Article
            </h2>
            <p className="text-xs text-slate-500">ID: {article.id} · Status: <span className="font-semibold uppercase text-[#0891B2]">{article.status}</span></p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-800 dark:text-slate-200">
          {/* Main Title & Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Article Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#0891B2]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                SEO Slug *
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono focus:outline-none focus:border-[#0891B2]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0891B2]"
              >
                <option value="Jalore">Jalore</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Crime">Crime</option>
                <option value="Politics">Politics</option>
                <option value="Education">Education</option>
                <option value="Weather">Weather</option>
                <option value="Business">Business</option>
                <option value="Sports">Sports</option>
                <option value="Local">Local</option>
              </select>
            </div>
          </div>

          {/* Excerpt & AI Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Short Excerpt
              </label>
              <textarea
                rows={3}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-[#0891B2] resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                AI Clean Summary
              </label>
              <textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-[#0891B2] resize-none"
              />
            </div>
          </div>

          {/* Full Article Content */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Article Content (HTML / Text)
            </label>
            <textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono focus:outline-none focus:border-[#0891B2]"
            />
          </div>

          {/* Featured Image & Video Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Featured Image URL
              </label>
              <input
                type="text"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-[#0891B2]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Video Embed / Stream URL (Optional)
              </label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="YouTube / Video stream URL"
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-[#0891B2]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Gallery Images (comma-separated URLs)
            </label>
            <input
              type="text"
              value={galleryImages}
              onChange={(e) => setGalleryImages(e.target.value)}
              placeholder="https://image1.jpg, https://image2.jpg"
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-[#0891B2]"
            />
          </div>

          {/* Source Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Source Name
              </label>
              <input
                type="text"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-[#0891B2]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Original Source URL
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-[#0891B2]"
                />
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-[#0891B2] hover:bg-cyan-50 rounded-lg shrink-0"
                  title="Visit original URL"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </div>

          {/* Location, Author & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-[#0891B2]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Author
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-[#0891B2]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-[#0891B2]"
              />
            </div>
          </div>

          {/* SEO Metadata Group */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              SEO & Social Metadata
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  SEO Meta Title
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-[#0891B2]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  SEO Keywords (comma separated)
                </label>
                <input
                  type="text"
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-[#0891B2]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                SEO Meta Description
              </label>
              <textarea
                rows={2}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-[#0891B2] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-2">
            <button
              disabled={isSaving}
              onClick={() => handleSubmit('rejected')}
              className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <XCircle size={15} />
              Reject Article
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              disabled={isSaving}
              onClick={() => handleSubmit(article.status)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Save size={15} />
              Save Draft
            </button>

            <button
              disabled={isSaving}
              onClick={() => handleSubmit('approved')}
              className="px-4 py-2 rounded-xl bg-[#0891B2] text-white hover:bg-cyan-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <CheckCircle2 size={15} />
              Approve Article
            </button>

            <button
              disabled={isSaving}
              onClick={() => handleSubmit('published')}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <CheckCircle2 size={15} />
              Publish Immediately
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
