import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { NAVIGATION_ITEMS } from '../../constants/navigation';
import * as Icons from 'lucide-react';
import toast from 'react-hot-toast';

const NavIcon: React.FC<{ name: string; className?: string }> = ({ name, className }) => {
  const IconComponent = (Icons as any)[name];
  if (!IconComponent) return <Icons.HelpCircle className={className} size={18} />;
  return <IconComponent className={className} size={18} />;
};

export const Sidebar: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { profile, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/admin/login');
    } catch (e) {
      toast.error('Logout failed');
    }
  };

  const contentItems = NAVIGATION_ITEMS.filter((item) => item.group === 'content');
  const audienceItems = NAVIGATION_ITEMS.filter((item) => item.group === 'audience');
  const analyticsItems = NAVIGATION_ITEMS.filter((item) => item.group === 'analytics');
  const systemItems = NAVIGATION_ITEMS.filter((item) => item.group === 'system');

  const renderLink = (item: typeof NAVIGATION_ITEMS[0], isMobile = false) => (
    <NavLink
      key={item.path}
      to={item.path}
      onClick={() => isMobile && sidebarOpen && toggleSidebar()}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group ${
          isActive
            ? 'bg-gradient-to-r from-[#0891B2] to-[#0EA5E9] text-white shadow-md shadow-[#0891B2]/20 font-semibold'
            : 'text-[#475569] dark:text-slate-400 hover:bg-[#ECFEFF] dark:hover:bg-slate-800/80 hover:text-[#0891B2] dark:hover:text-cyan-400'
        }`
      }
      title={!sidebarOpen && !isMobile ? item.label : undefined}
    >
      <NavIcon name={item.icon} className="shrink-0 transition-transform group-hover:scale-110" />
      {(sidebarOpen || isMobile) && <span className="truncate">{item.label}</span>}
    </NavLink>
  );

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {sidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="lg:hidden fixed inset-0 bg-[#0F172A]/50 backdrop-blur-xs z-40 animate-fade-in"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-white dark:bg-[#0F172A] text-[#475569] dark:text-slate-300 border-r border-[#E2E8F0] dark:border-slate-800 z-50 transition-all duration-300 flex flex-col justify-between ${
          sidebarOpen ? 'w-64 translate-x-0' : 'w-20 max-lg:-translate-x-full'
        }`}
      >
        {/* Upper Logo & Collapse Toggle */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="h-[70px] flex items-center justify-between px-5 border-b border-[#E2E8F0] dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-3 overflow-hidden">
              <img
                src="/logo.png"
                alt="Daily Bharat Logo"
                className="h-9 w-auto object-contain shrink-0"
              />
              {sidebarOpen && (
                <span className="font-serif font-bold text-base text-[#0F172A] dark:text-white tracking-tight whitespace-nowrap">
                  Daily<span className="text-[#0891B2]">Bharat</span>
                </span>
              )}
            </div>
            <button
              onClick={toggleSidebar}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[#F8FAFC] dark:hover:bg-slate-800 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition cursor-pointer"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <Icons.ChevronLeft size={18} /> : <Icons.ChevronRight size={18} />}
            </button>
          </div>

          {/* Scrollable Navigation Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
            {/* Content Group */}
            <div className="space-y-1">
              {sidebarOpen && (
                <p className="text-[10px] font-bold text-[#64748B] dark:text-slate-500 uppercase tracking-widest px-3.5 mb-2">
                  Content Management
                </p>
              )}
              {contentItems.map((item) => renderLink(item))}
            </div>

            {/* Audience Group */}
            <div className="space-y-1">
              {sidebarOpen && (
                <p className="text-[10px] font-bold text-[#64748B] dark:text-slate-500 uppercase tracking-widest px-3.5 mb-2">
                  Audience Relations
                </p>
              )}
              {audienceItems.map((item) => renderLink(item))}
            </div>

            {/* Analytics Group */}
            <div className="space-y-1">
              {sidebarOpen && (
                <p className="text-[10px] font-bold text-[#64748B] dark:text-slate-500 uppercase tracking-widest px-3.5 mb-2">
                  Reporting
                </p>
              )}
              {analyticsItems.map((item) => renderLink(item))}
            </div>

            {/* System Group */}
            <div className="space-y-1">
              {sidebarOpen && (
                <p className="text-[10px] font-bold text-[#64748B] dark:text-slate-500 uppercase tracking-widest px-3.5 mb-2">
                  Administration
                </p>
              )}
              {systemItems.map((item) => renderLink(item))}
            </div>
          </div>
        </div>

        {/* Footer Profile & Logout Info */}
        <div className="p-4 border-t border-[#E2E8F0] dark:border-slate-800 bg-[#F8FAFC]/70 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div
              className="flex items-center gap-3 overflow-hidden cursor-pointer flex-1 min-w-0"
              onClick={() => navigate('/admin/profile')}
            >
              <img
                src={profile?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150'}
                alt={profile?.full_name || 'Admin'}
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-[#0891B2]/20 shrink-0"
              />
              {sidebarOpen && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#0F172A] dark:text-white truncate">
                    {profile?.full_name || 'System Admin'}
                  </p>
                  <p className="text-[10px] font-semibold text-[#0891B2] dark:text-cyan-400 uppercase tracking-wider truncate">
                    {profile?.role || 'superadmin'}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-[#64748B] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition shrink-0 cursor-pointer"
              title="Log Out"
            >
              <Icons.LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
