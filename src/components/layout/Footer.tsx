import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Inline SVG brand icons
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
);
const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12z"/></svg>
);
const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
);

const QUICK_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Blog', to: '/' },
  { label: 'Contact', to: '/contact' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
];

const POPULAR_CATEGORIES = [
  'Web Development',
  'React',
  'UI/UX Design',
  'Artificial Intelligence',
  'Technology',
  'Business',
];

const SOCIAL_LINKS = [
  { Icon: FacebookIcon, label: 'Facebook', href: '#', color: 'hover:bg-blue-600' },
  { Icon: InstagramIcon, label: 'Instagram', href: '#', color: 'hover:bg-pink-600' },
  { Icon: XIcon, label: 'X / Twitter', href: '#', color: 'hover:bg-slate-700' },
  { Icon: LinkedInIcon, label: 'LinkedIn', href: '#', color: 'hover:bg-blue-700' },
  { Icon: YouTubeIcon, label: 'YouTube', href: '#', color: 'hover:bg-red-600' },
  { Icon: GitHubIcon, label: 'GitHub', href: '#', color: 'hover:bg-slate-900' },
];

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <>
      <footer className="bg-[#0F172A] text-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

            {/* Brand Column */}
            <div className="lg:col-span-1">
              <Link to="/" className="flex items-center gap-3 mb-4">
                <img
                  src="/logo.png"
                  alt="Daily Bharat Logo"
                  className="h-10 w-auto object-contain bg-white rounded-xl p-1 shadow-sm"
                />
                <span className="font-serif font-bold text-xl text-white tracking-tight">
                  Daily <span className="text-[#06B6D4]">Bharat</span>
                </span>
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Delivering high-quality articles, tutorials, and insights on modern web development, design, and technology.
              </p>
              <div className="flex flex-wrap gap-2">
                {SOCIAL_LINKS.map(({ Icon, label, href, color }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    title={label}
                    className={`w-9 h-9 flex items-center justify-center rounded-full bg-[#1E293B] text-slate-400 hover:text-white ${color} transition-all duration-200 hover:scale-110`}
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-serif font-bold text-base mb-5 text-white">Quick Links</h3>
              <ul className="space-y-2.5">
                {QUICK_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-slate-400 hover:text-[#06B6D4] text-sm transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-[#06B6D4] transition-colors" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Popular Categories */}
            <div>
              <h3 className="font-serif font-bold text-base mb-5 text-white">Popular Categories</h3>
              <ul className="space-y-2.5">
                {POPULAR_CATEGORIES.map((cat) => (
                  <li key={cat}>
                    <Link
                      to={`/?category=${encodeURIComponent(cat)}`}
                      className="text-slate-400 hover:text-[#06B6D4] text-sm transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-[#06B6D4] transition-colors" />
                      {cat}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter + Contact */}
            <div>
              <h3 className="font-serif font-bold text-base mb-5 text-white">Stay Updated</h3>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                Subscribe to get the latest posts and insights delivered to your inbox.
              </p>
              {subscribed ? (
                <div className="bg-[#0891B2]/20 border border-[#0891B2]/30 text-[#06B6D4] text-sm px-4 py-3 rounded-xl">
                  ✓ You're subscribed! Welcome aboard.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-[#1E293B] border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#0891B2] focus:ring-1 focus:ring-[#0891B2] transition"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#0891B2] hover:bg-[#0e7490] text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
                  >
                    Subscribe Now
                  </button>
                </form>
              )}
              <div className="mt-6 space-y-2 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-[#06B6D4]" />
                  <span>hello@insightjournal.com</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm text-center sm:text-left">
              © 2026 Daily Bharat. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Terms & Conditions</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 w-11 h-11 bg-[#0891B2] hover:bg-[#0e7490] text-white rounded-full shadow-lg flex items-center justify-center z-40 transition-colors"
            aria-label="Back to top"
          >
            <ArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};
