import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import type { Agent } from '../../../types/agent';
import { supabase } from '../../../lib/supabase/client';
import { Send, Save, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Jalore News',
  'Rajasthan Local',
  'Crime & Police',
  'Politics & Governance',
  'Education & Schools',
  'Weather & Environment',
  'Business & Mandi',
  'Sports & Youth',
  'Culture & Events',
];

export const AgentCreateNewsPage: React.FC = () => {
  const { agent } = useOutletContext<{ agent: Agent }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [galleryImages, setGalleryImages] = useState('');
  const [category, setCategory] = useState(agent.category || CATEGORIES[0]);
  const [subcategory, setSubcategory] = useState('');
  const [city, setCity] = useState(agent.city || 'Jalore');
  const [district, setDistrict] = useState(agent.district || 'Jalore');
  const [tags, setTags] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [keywords, setKeywords] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + Date.now().toString().slice(-4);
  };

  const handleSave = async (targetStatus: 'draft' | 'pending' | 'published') => {
    if (!title.trim() || !content.trim()) {
      toast.error('Article Title and Content are required.');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading(targetStatus === 'draft' ? 'Saving draft…' : 'Submitting for review…');

    try {
      const slug = generateSlug(title);
      const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
      const galleryList = galleryImages.split(',').map((img) => img.trim()).filter(Boolean);
      const keywordList = keywords.split(',').map((k) => k.trim()).filter(Boolean);

      const locationStr = `${city.trim()}, ${district.trim()}`;

      const payload = {
        title: title.trim(),
        slug,
        excerpt: excerpt.trim() || title.slice(0, 150),
        content: content.trim(),
        summary: excerpt.trim() || title.slice(0, 150),
        category,
        subcategory: subcategory.trim() || null,
        location: locationStr,
        author: agent.full_name,
        author_id: agent.user_id,
        featured_image: featuredImage.trim() || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1000',
        gallery_images: galleryList,
        source_name: `Agent: ${agent.full_name}`,
        source_url: `https://dailybharat.com/agent-news/${slug}`,
        source_published_at: new Date().toISOString(),
        published_at: targetStatus === 'published' ? new Date().toISOString() : null,
        status: targetStatus,
        tags: tagList,
        seo_title: seoTitle.trim() || title.trim(),
        seo_description: seoDescription.trim() || excerpt.trim(),
        seo_keywords: keywordList,
      };

      const { error } = await supabase.from('news_articles').insert([payload]);

      if (error) throw error;

      // Log notification
      if (targetStatus === 'pending') {
        await supabase.from('notifications').insert([
          {
            user_id: agent.user_id,
            title: 'Article Submitted for Review',
            message: `Your story "${title}" has been submitted to the admin team for approval.`,
            type: 'article_submitted',
          },
        ]);
      }

      toast.success(
        targetStatus === 'draft' ? 'Draft saved successfully!' : 'Article submitted for review!',
        { id: toastId }
      );
      navigate('/agent/news');
    } catch (err: any) {
      console.error('Save failed:', err);
      toast.error(`Save failed: ${err?.message || 'Error occurred'}`, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">Create News Story</h1>
            <p className="text-xs text-slate-500">Report authentic ground news from {agent.district || 'Jalore'}.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave('draft')}
            disabled={submitting}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-2 hover:bg-slate-100 transition cursor-pointer"
          >
            <Save size={15} /> Save Draft
          </button>

          <button
            onClick={() => handleSave('pending')}
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0891B2] to-[#0EA5E9] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-[#0891B2]/20 hover:opacity-95 transition cursor-pointer"
          >
            {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            Submit for Review
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        {/* Story Title */}
        <div>
          <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
            Headline / Article Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. जालौर में राधा महल का भव्य आयोजन, 1 करोड़ रुपये की लागत..."
            className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-semibold focus:outline-none focus:border-[#0891B2]"
          />
        </div>

        {/* Short Summary */}
        <div>
          <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
            Short Description / Excerpt
          </label>
          <textarea
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Key highlights summarizing the story in 2-3 sentences..."
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-[#0891B2] resize-none"
          />
        </div>

        {/* Full Content */}
        <div>
          <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
            Full Article Content *
          </label>
          <textarea
            rows={10}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write the complete news story here..."
            className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs focus:outline-none focus:border-[#0891B2] leading-relaxed"
          />
        </div>

        {/* Category & Location Details */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">Subcategory</label>
            <input
              type="text"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              placeholder="e.g. Local Event"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">City / Tehsil</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Raniwara"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">District</label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="Jalore"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
            />
          </div>
        </div>

        {/* Media URLs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">Featured Image URL</label>
            <input
              type="url"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">Gallery Image URLs (Comma-separated)</label>
            <input
              type="text"
              value={galleryImages}
              onChange={(e) => setGalleryImages(e.target.value)}
              placeholder="url1, url2..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">Tags (Comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Jalore, Crime, Local News..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
            />
          </div>
        </div>

        {/* SEO Metadata */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#0891B2]">SEO & Search Engine Optimization</h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">SEO Meta Title</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Title optimized for Google Search"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">SEO Description</label>
              <input
                type="text"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Search engine meta description..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">SEO Keywords</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="jalore news, bagra school, patrika..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AgentCreateNewsPage;
