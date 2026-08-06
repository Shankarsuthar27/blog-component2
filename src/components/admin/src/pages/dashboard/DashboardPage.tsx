import React from 'react';
import { StatCard } from '../../components/cards/StatCard';
import { useDashboardStats, useDashboardViewTrend } from '../../hooks/useDashboard';
import { useBlogs } from '../../hooks/useBlogs';
import { useActivityLogs } from '../../hooks/useActivityLogs';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: viewTrend } = useDashboardViewTrend();
  const { data: blogs } = useBlogs();
  const { data: activityLogs } = useActivityLogs();

  const recentPosts = (blogs || []).slice(0, 4);

  // Fallback chart data if no views recorded yet
  const chartData = (viewTrend && viewTrend.length > 0)
    ? viewTrend
    : [
        { month: 'Jan', views: 0, posts: 0 },
        { month: 'Feb', views: 0, posts: 0 },
        { month: 'Mar', views: 0, posts: 0 },
      ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-white leading-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Realtime operations monitoring center for Daily Bharat.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/admin/blogs/new')}
            className="bg-cyan-500 hover:bg-cyan-600 active:scale-[0.98] text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-500/10 flex items-center gap-2 transition cursor-pointer"
          >
            <Icons.Plus size={16} /> New Article
          </button>
        </div>
      </div>

      {/* Metrics Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Views"
          value={statsLoading ? '...' : (stats?.totalViews || 0).toLocaleString()}
          icon="Eye"
          trend={{ value: 'all time', isPositive: true }}
        />
        <StatCard
          title="Published Articles"
          value={statsLoading ? '...' : stats?.publishedBlogs || 0}
          icon="BookOpen"
          trend={{ value: `${stats?.draftBlogs || 0} drafts`, isPositive: true }}
        />
        <StatCard
          title="Pending Comments"
          value={statsLoading ? '...' : stats?.pendingComments || 0}
          icon="MessageSquare"
        />
        <StatCard
          title="Subscribers"
          value={statsLoading ? '...' : stats?.totalSubscribers || 0}
          icon="Mail"
          trend={{ value: 'newsletter', isPositive: true }}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Traffic View Area chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-950 dark:text-white mb-4 flex items-center gap-2">
            <Icons.TrendingUp size={16} className="text-cyan-500" /> Readers traffic trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="views" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Publishing frequency chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-950 dark:text-white mb-4 flex items-center gap-2">
            <Icons.Calendar size={16} className="text-amber-500" /> Publishing Frequency
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Bar dataKey="posts" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables & Activities Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Blogs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-950 dark:text-white">Recent Articles</h3>
            <button
              onClick={() => navigate('/admin/blogs')}
              className="text-xs font-semibold text-cyan-600 hover:text-cyan-500"
            >
              View all
            </button>
          </div>
          <div className="space-y-4">
            {recentPosts.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">No articles yet. Create your first one!</p>
            )}
            {recentPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer"
                onClick={() => navigate(`/admin/blogs/edit/${post.id}`)}
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                  {post.featured_image ? (
                    <img src={post.featured_image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Icons.Image size={20} />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate leading-snug">{post.title}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{post.reading_time} · {post.views.toLocaleString()} views</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  post.status === 'published' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {post.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Logs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-950 dark:text-white">Recent Activities</h3>
            <button
              onClick={() => navigate('/admin/activity-logs')}
              className="text-xs font-semibold text-cyan-600 hover:text-cyan-500"
            >
              View logs
            </button>
          </div>
          <div className="space-y-4">
            {(activityLogs || []).length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">No activity yet.</p>
            )}
            {(activityLogs || []).slice(0, 4).map((log) => (
              <div key={log.id} className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                  <Icons.History size={14} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-snug">{log.details}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{new Date(log.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
};
export default DashboardPage;
