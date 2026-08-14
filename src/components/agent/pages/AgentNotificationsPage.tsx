import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Agent } from '../../../types/agent';
import { supabase } from '../../../lib/supabase/client';
import { Bell, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export const AgentNotificationsPage: React.FC = () => {
  const { agent } = useOutletContext<{ agent: Agent }>();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', agent.user_id)
        .order('created_at', { ascending: false });

      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [agent]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', agent.user_id);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read');
    } catch (err: any) {
      toast.error(`Failed: ${err.message}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">Notifications Center</h1>
          <p className="text-xs text-slate-500">Updates regarding your agent status and story approvals.</p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 transition cursor-pointer flex items-center gap-1.5"
        >
          <Check size={14} /> Mark All as Read
        </button>
      </div>

      <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-3">
        {loading ? (
          <p className="text-xs text-slate-400 text-center py-8">Loading notifications…</p>
        ) : notifications.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <Bell size={36} className="text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No notifications yet</p>
            <p className="text-xs text-slate-400">You will receive notifications when your stories or status updates occur.</p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleMarkAsRead(item.id)}
              className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3.5 ${
                item.is_read
                  ? 'bg-white dark:bg-[#1E293B] border-slate-100 dark:border-slate-800 opacity-80'
                  : 'bg-cyan-50/50 dark:bg-cyan-950/20 border-cyan-200/60 font-semibold'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-[#0891B2]/10 text-[#0891B2] flex items-center justify-center shrink-0 mt-0.5">
                <Bell size={18} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h4>
                  <span className="text-[10px] text-slate-400">{new Date(item.created_at).toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{item.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default AgentNotificationsPage;
