import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';
import type { Agent } from '../../types/agent';
import {
  LayoutDashboard,
  User,
  PlusCircle,
  Newspaper,
  Share2,
  BarChart3,
  Bell,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/agent/dashboard', icon: LayoutDashboard },
  { label: 'My Profile', path: '/agent/profile', icon: User },
  { label: 'Create News', path: '/agent/news/create', icon: PlusCircle },
  { label: 'My News', path: '/agent/news', icon: Newspaper },
  { label: 'Referrals', path: '/agent/referrals', icon: Share2 },
  { label: 'Analytics', path: '/agent/analytics', icon: BarChart3 },
  { label: 'Notifications', path: '/agent/notifications', icon: Bell },
];

export const AgentLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Instant synchronous state initialization from cache if available
  const [agent, setAgent] = useState<Agent | null>(() => {
    try {
      const cached = localStorage.getItem('agent_session_cache');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(!agent);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [darkMode, setDarkMode] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, [location.pathname]);

  // Fast background Auth verification
  useEffect(() => {
    let isMounted = true;
    const verifyAgent = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          localStorage.removeItem('agent_session_cache');
          if (isMounted) navigate('/agent/login', { replace: true });
          return;
        }

        // Fetch agent record
        const { data: agentData } = await supabase
          .from('agents')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (agentData && agentData.status === 'active') {
          if (isMounted) {
            setAgent(agentData as Agent);
            localStorage.setItem('agent_session_cache', JSON.stringify(agentData));
          }

          // Fetch unread notifications count in background
          const { count } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', session.user.id)
            .eq('is_read', false);

          if (isMounted) setUnreadNotifications(count || 0);
        } else if (agentData?.status !== 'active') {
          localStorage.removeItem('agent_session_cache');
          toast.error('Agent account not active or pending approval.');
          await supabase.auth.signOut();
          if (isMounted) navigate('/agent/login', { replace: true });
        }
      } catch (err) {
        console.error('Agent auth verification notice:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    verifyAgent();
    return () => { isMounted = false; };
  }, [navigate]);

  const handleLogout = async () => {
    localStorage.removeItem('agent_session_cache');
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    navigate('/agent/login', { replace: true });
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center space-y-3">
          <Loader2 className="animate-spin text-[#0891B2] mx-auto" size={40} />
          <p className="text-xs font-semibold text-slate-500">Loading Agent Portal Workspace…</p>
        </div>
      </div>
    );
  }

  if (!agent) return null;

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0F172A] text-slate-800 dark:text-slate-200 antialiased overflow-x-hidden w-full">

      {/* Mobile Drawer Overlay Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40"
        />
      )}

      {/* Agent Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-800 z-50 transition-all duration-300 flex flex-col justify-between ${
          sidebarOpen ? 'w-64 translate-x-0' : 'w-20 max-lg:-translate-x-full'
        }`}
      >
        <div className="flex-1 flex flex-col min-h-0">
          {/* Logo & Header */}
          <div className="h-[70px] flex items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img src="/logo.png" alt="Daily Bharat" className="h-8 w-auto shrink-0" />
              {sidebarOpen && (
                <div className="min-w-0">
                  <span className="font-serif font-bold text-sm text-slate-900 dark:text-white truncate block leading-tight">
                    Agent<span className="text-[#0891B2]">Panel</span>
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold flex items-center gap-0.5">
                    <CheckCircle size={10} /> Verified
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition cursor-pointer"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-[#0891B2] to-[#0EA5E9] text-white shadow-md shadow-[#0891B2]/20'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-cyan-50 dark:hover:bg-slate-800/80 hover:text-[#0891B2]'
                    }`
                  }
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <Icon size={18} className="shrink-0 group-hover:scale-105 transition-transform" />
                  {sidebarOpen && (
                    <span className="truncate flex-1 flex items-center justify-between">
                      {item.label}
                      {item.label === 'Notifications' && unreadNotifications > 0 && (
                        <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {unreadNotifications}
                        </span>
                      )}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Footer Agent ID & Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 text-[#0891B2] font-bold flex items-center justify-center shrink-0">
                {agent.full_name.charAt(0)}
              </div>
              {sidebarOpen && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{agent.full_name}</p>
                  <p className="text-[10px] font-mono font-bold text-[#0891B2] truncate">{agent.agent_id}</p>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition shrink-0 cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div
        className={`flex-grow flex flex-col min-h-screen transition-all duration-300 w-full overflow-x-hidden ${
          sidebarOpen ? 'lg:pl-64' : 'lg:pl-20'
        }`}
      >
        {/* Top Header */}
        <header className={`fixed top-0 right-0 z-20 h-[70px] bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-all duration-300 left-0 ${
          sidebarOpen ? 'lg:pl-64' : 'lg:pl-20'
        }`}>
          <div className="h-full px-4 md:px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 transition cursor-pointer"
              >
                <Menu size={18} />
              </button>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                <span className="hidden sm:inline text-slate-400">Agent Portal</span>
                <span className="hidden sm:inline">/</span>
                <span className="text-[#0891B2] font-mono">{agent.agent_id}</span>
                <span>({agent.city || agent.district || 'Jalore'})</span>
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <NavLink
                to="/agent/notifications"
                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Notifications"
              >
                <Bell size={18} />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
                )}
              </NavLink>

              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-[#0891B2]" />}
              </button>

              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                  {agent.referral_code}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Viewport View */}
        <main className="flex-grow px-3 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-12 max-w-[1400px] w-full mx-auto overflow-x-hidden">
          <Outlet context={{ agent }} />
        </main>
      </div>

    </div>
  );
};
export default AgentLayout;
