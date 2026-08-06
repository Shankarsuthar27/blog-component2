import React from 'react';

// Inline SVG brand icons (Lucide v1.28 doesn't have social brand icons)
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/>
  </svg>
);
const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12z"/>
  </svg>
);
const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
  </svg>
);

const SOCIALS = [
  { Icon: FacebookIcon, label: 'Facebook', href: '#', hoverBg: 'hover:bg-blue-600 hover:border-blue-600' },
  { Icon: InstagramIcon, label: 'Instagram', href: '#', hoverBg: 'hover:bg-pink-600 hover:border-pink-600' },
  { Icon: XIcon, label: 'X / Twitter', href: '#', hoverBg: 'hover:bg-slate-800 hover:border-slate-800' },
  { Icon: LinkedInIcon, label: 'LinkedIn', href: '#', hoverBg: 'hover:bg-blue-700 hover:border-blue-700' },
  { Icon: YouTubeIcon, label: 'YouTube', href: '#', hoverBg: 'hover:bg-red-600 hover:border-red-600' },
  { Icon: GitHubIcon, label: 'GitHub', href: '#', hoverBg: 'hover:bg-slate-900 hover:border-slate-900' },
];

export const SocialWidget: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h3 className="font-serif font-bold text-[#0F172A] text-base mb-1.5">Follow Us</h3>
      <p className="text-xs text-[#64748B] mb-4">Stay connected on social media</p>
      <div className="grid grid-cols-3 gap-3">
        {SOCIALS.map(({ Icon, label, href, hoverBg }) => (
          <a
            key={label}
            href={href}
            title={label}
            aria-label={label}
            className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border border-slate-200 text-[#64748B] hover:text-white transition-all duration-200 hover:scale-105 hover:shadow-md ${hoverBg}`}
          >
            <Icon />
            <span className="text-[10px] font-medium leading-none">
              {label.split(' ')[0]}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};
