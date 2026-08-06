import React, { useState, useEffect } from 'react';
import { useSettings, useSaveSettings } from '../../hooks/useSettings';
import { Save, ShieldAlert, Settings, Share2, Search, Loader2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { data: settings, isLoading } = useSettings();
  const saveSettings = useSaveSettings();

  const [websiteName, setWebsiteName] = useState('Daily Bharat');
  const [footerText, setFooterText] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [commentMod, setCommentMod] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  const [fb, setFb] = useState('');
  const [tw, setTw] = useState('');
  const [inLink, setInLink] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [activeTab, setActiveTab] = useState<'general' | 'seo' | 'social'>('general');

  // Populate form when settings load
  useEffect(() => {
    if (settings) {
      setWebsiteName(settings.website_name || 'Daily Bharat');
      setFooterText(settings.footer_text || '');
      setSeoTitle(settings.seo_default_title || '');
      setSeoDesc(settings.seo_default_description || '');
      setCommentMod(settings.comment_moderation_enabled ?? true);
      setMaintenance(settings.maintenance_mode ?? false);
      const links = settings.social_links || {};
      setFb(links.facebook || '');
      setTw(links.twitter || '');
      setInLink(links.instagram || '');
      setLinkedin(links.linkedin || '');
      setGithub(links.github || '');
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings.mutateAsync({
      website_name: websiteName,
      footer_text: footerText,
      seo_default_title: seoTitle,
      seo_default_description: seoDesc,
      comment_moderation_enabled: commentMod,
      maintenance_mode: maintenance,
      social_links: { facebook: fb, twitter: tw, instagram: inLink, linkedin, github },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="animate-spin text-cyan-500" size={32} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">
            System Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure system settings, SEO index headers, and social accounts.
          </p>
        </div>
        <button
          type="submit"
          disabled={saveSettings.isPending}
          className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-60 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/10 cursor-pointer"
        >
          {saveSettings.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saveSettings.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

        {/* Nav Tabs */}
        <div className="md:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm space-y-1 h-fit">
          {[
            { id: 'general', label: 'General Site Information', icon: Settings },
            { id: 'seo', label: 'SEO Configuration', icon: Search },
            { id: 'social', label: 'Social Networks', icon: Share2 },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id as any)}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === id
                  ? 'bg-cyan-50 text-cyan-600'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {/* Tab Forms */}
        <div className="md:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          {activeTab === 'general' && (
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-slate-950 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <Settings size={16} className="text-cyan-500" /> Website Parameters
              </h3>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Website Name</label>
                <input
                  type="text"
                  required
                  value={websiteName}
                  onChange={(e) => setWebsiteName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-transparent rounded-xl text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Footer Credits Text</label>
                <input
                  type="text"
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-transparent rounded-xl text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex gap-2.5">
                  <ShieldAlert className="text-amber-500 shrink-0" size={18} />
                  <div>
                    <p className="text-xs font-bold text-slate-950 dark:text-white">Maintenance Mode</p>
                    <p className="text-[10px] text-slate-400 leading-normal mt-0.5">Offline block incoming requests and display screen placeholder.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={maintenance}
                  onChange={(e) => setMaintenance(e.target.checked)}
                  className="rounded border-amber-300 text-amber-500 focus:ring-amber-500/20"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl">
                <div>
                  <p className="text-xs font-bold text-slate-950 dark:text-white">Comment Moderation Required</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Require administrator approval before a comment appears.</p>
                </div>
                <input
                  type="checkbox"
                  checked={commentMod}
                  onChange={(e) => setCommentMod(e.target.checked)}
                  className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500/20"
                />
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-950 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <Search size={16} className="text-cyan-500" /> Default Meta Tags
              </h3>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">SEO Title Prefix</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-transparent rounded-xl text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Default Meta Description</label>
                <textarea
                  value={seoDesc}
                  onChange={(e) => setSeoDesc(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-transparent rounded-xl text-xs focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-950 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <Share2 size={16} className="text-cyan-500" /> Connected Accounts
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Facebook Page', value: fb, setter: setFb, placeholder: 'https://facebook.com/brand' },
                  { label: 'Twitter / X URL', value: tw, setter: setTw, placeholder: 'https://x.com/brand' },
                  { label: 'Instagram Handle', value: inLink, setter: setInLink, placeholder: 'https://instagram.com/brand' },
                  { label: 'LinkedIn Page', value: linkedin, setter: setLinkedin, placeholder: 'https://linkedin.com/company/brand' },
                  { label: 'GitHub Profile', value: github, setter: setGithub, placeholder: 'https://github.com/brand' },
                ].map(({ label, value, setter, placeholder }) => (
                  <div key={label}>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
                    <input
                      type="url"
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      placeholder={placeholder}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-transparent rounded-xl text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  );
};
export default SettingsPage;
