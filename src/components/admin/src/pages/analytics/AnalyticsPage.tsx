import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useDashboardViewTrend, useDashboardStats } from '../../hooks/useDashboard';
import { useBlogs } from '../../hooks/useBlogs';
import { useCategories } from '../../hooks/useCategories';
import { BarChart3, TrendingUp, Cpu, Clock, Loader2 } from 'lucide-react';

const COLORS = ['#0ea5e9', '#10b981', '#06b6d4', '#ec4899', '#f59e0b', '#8b5cf6'];

export const AnalyticsPage: React.FC = () => {
  const { data: viewTrend = [], isLoading: trendLoading } = useDashboardViewTrend();
  const { data: stats } = useDashboardStats();
  const { data: blogs = [] } = useBlogs();
  const { data: categories = [] } = useCategories();

  // Top blogs by views from real data
  const topBlogs = [...blogs]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)
    .map((b) => ({
      name: b.title.length > 22 ? `${b.title.slice(0, 22)}...` : b.title,
      views: b.views
    }));

  // Category distribution from real blog counts
  const categoryDistribution = categories
    .filter((c) => (c.blog_count || 0) > 0)
    .map((c) => ({ name: c.name, value: c.blog_count || 0 }));

  const chartData = viewTrend.length > 0 ? viewTrend : [
    { month: 'No data', views: 0, posts: 0 }
  ];

  const totalViews = stats?.totalViews || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">
          Reporting & Analytics
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Detailed metrics over publishing volumes, category distributions, and reader engagements.
          <span className="ml-2 font-semibold text-cyan-600">{totalViews.toLocaleString()} total views</span>
        </p>
      </div>

      {trendLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-cyan-500" size={32} />
        </div>
      )}

      {!trendLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Monthly views */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-950 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-cyan-500" /> Readers traffic growth
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

          {/* Top 5 Blogs */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-950 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 size={16} className="text-amber-500" /> Top Articles by views
            </h3>
            <div className="h-64">
              {topBlogs.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topBlogs} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} width={120} />
                    <Tooltip />
                    <Bar dataKey="views" fill="#f97316" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                  No blog view data yet
                </div>
              )}
            </div>
          </div>

          {/* Category distribution */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-950 dark:text-white mb-4 flex items-center gap-2">
              <Cpu size={16} className="text-emerald-500" /> Category Distribution
            </h3>
            <div className="h-64 flex items-center">
              {categoryDistribution.length > 0 ? (
                <>
                  <div className="w-[55%] h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {categoryDistribution.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-[45%] space-y-2 text-xs font-semibold pl-2">
                    {categoryDistribution.map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-slate-600 dark:text-slate-400 truncate">{entry.name}</span>
                        <span className="ml-auto text-slate-400 text-[10px]">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center w-full text-slate-400 text-sm">
                  No category data yet
                </div>
              )}
            </div>
          </div>

          {/* Engagement stats */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <h3 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
              <Clock size={16} className="text-cyan-500" /> Content Overview
            </h3>

            <div className="grid grid-cols-2 gap-4 mt-4">
              {[
                { label: 'Total Blogs', value: stats?.totalBlogs || 0, color: 'text-cyan-600' },
                { label: 'Published', value: stats?.publishedBlogs || 0, color: 'text-emerald-600' },
                { label: 'Drafts', value: stats?.draftBlogs || 0, color: 'text-amber-600' },
                { label: 'Scheduled', value: stats?.scheduledBlogs || 0, color: 'text-blue-600' },
                { label: 'Comments', value: stats?.totalComments || 0, color: 'text-violet-600' },
                { label: 'Subscribers', value: stats?.totalSubscribers || 0, color: 'text-pink-600' },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <p className={`text-2xl font-serif font-bold ${color}`}>{value.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AnalyticsPage;
