import React, { useState, useEffect } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { CommandPalette } from '../navigation/CommandPalette';

export const TopNav: React.FC = () => {
  const { sidebarOpen, darkMode, toggleDarkMode, toggleSidebar } = useUIStore();
  const { profile, logout } = useAuthStore();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const currentPath = location.pathname.split('/')[2] || 'dashboard';
  const pageTitle = currentPath.charAt(0).toUpperCase() + currentPath.slice(1).replace('-', ' ');

  return (
    <>
      <header
        className={`fixed top-0 right-0 z-20 h-[70px] bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-xl border-b border-[#E2E8F0] dark:border-slate-800 transition-all duration-300 left-0 ${
          sidebarOpen ? 'lg:pl-64' : 'lg:pl-20'
        }`}
      >
        <div className="h-full px-4 md:px-6 flex items-center justify-between">
          {/* Left Side: Mobile Hamburger & Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#F8FAFC] dark:bg-slate-800 text-[#475569] dark:text-slate-300 hover:text-[#0F172A] dark:hover:text-white transition cursor-pointer border border-[#E2E8F0] dark:border-slate-700"
              aria-label="Toggle navigation menu"
            >
              <Icons.Menu size={18} />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              <span className="hidden sm:inline">Admin</span>
              <Icons.ChevronRight size={12} className="hidden sm:inline" />
              <span className="text-[#0F172A] dark:text-white font-bold capitalize">{pageTitle}</span>
            </div>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-2 md:gap-3">

            {/* Command Palette Trigger Search */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden md:flex items-center gap-2 px-3.5 py-2 bg-[#F8FAFC] dark:bg-slate-800/80 border border-[#E2E8F0] dark:border-slate-700 text-[#64748B] rounded-xl hover:border-[#D80408]/50 hover:bg-white dark:hover:bg-slate-800 transition text-xs cursor-pointer group shadow-xs"
            >
              <Icons.Search size={14} className="text-[#64748B] group-hover:text-[#D80408] transition" />
              <span className="text-[#475569] dark:text-slate-300 font-medium">Quick search...</span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-mono font-bold bg-white dark:bg-slate-900 text-[#64748B] border border-[#E2E8F0] dark:border-slate-700 rounded-md shadow-2xs">
                Ctrl K
              </kbd>
            </button>

            {/* View Live Site Button */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#D80408] bg-[#ECFEFF] dark:bg-cyan-950/40 border border-[#CFFAFE] dark:border-cyan-800/50 rounded-xl hover:bg-[#CFFAFE] transition shadow-2xs"
              title="View Live Blog Site"
            >
              <Icons.ExternalLink size={13} /> View Live Site
            </a>

            {/* Dark Mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-[#64748B] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F8FAFC] dark:hover:bg-slate-800 transition cursor-pointer border border-[#E2E8F0] dark:border-slate-800"
              title="Toggle theme mode"
            >
              {darkMode ? <Icons.Sun size={18} className="text-amber-400" /> : <Icons.Moon size={18} className="text-[#D80408]" />}
            </button>

            {/* User profile dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#F8FAFC] dark:hover:bg-slate-800 transition cursor-pointer">
                <img
                  src={profile?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150'}
                  alt={profile?.full_name || 'Admin'}
                  className="w-8 h-8 rounded-xl object-cover ring-2 ring-[#D80408]/20"
                />
                <span className="hidden md:block text-xs font-bold text-[#0F172A] dark:text-white pr-1">
                  {profile?.full_name?.split(' ')[0] || 'Admin'}
                </span>
              </button>

              {/* Float Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl shadow-xl py-2 hidden group-hover:block hover:block z-30">
                <div className="px-4 py-2 border-b border-[#E2E8F0] dark:border-slate-800">
                  <p className="text-xs font-bold text-[#0F172A] dark:text-white truncate">{profile?.full_name || 'Admin User'}</p>
                  <p className="text-[10px] text-[#64748B] font-mono truncate">{profile?.email || 'admin2233@insightjournal.com'}</p>
                </div>

                <Link
                  to="/admin/profile"
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[#475569] dark:text-slate-300 hover:bg-[#ECFEFF] dark:hover:bg-slate-800 hover:text-[#D80408] transition"
                >
                  <Icons.User size={14} /> My Profile
                </Link>
                <Link
                  to="/admin/settings"
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[#475569] dark:text-slate-300 hover:bg-[#ECFEFF] dark:hover:bg-slate-800 hover:text-[#D80408] transition"
                >
                  <Icons.Settings size={14} /> System Settings
                </Link>
                <hr className="my-1 border-[#E2E8F0] dark:border-slate-800" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition text-left cursor-pointer"
                >
                  <Icons.LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Command Palette Modal */}
      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
    </>
  );
};
