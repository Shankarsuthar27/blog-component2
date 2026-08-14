import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Agent } from '../../../types/agent';
import { supabase } from '../../../lib/supabase/client';
import { Share2, Copy, Check, MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export const AgentReferralsPage: React.FC = () => {
  const { agent } = useOutletContext<{ agent: Agent }>();
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const referralUrl = `${window.location.origin}/become-agent?ref=${agent.referral_code}`;

  useEffect(() => {
    const fetchReferrals = async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from('agent_referrals')
          .select('*')
          .eq('agent_id', agent.id)
          .order('created_at', { ascending: false });

        setReferrals(data || []);
      } catch (err) {
        console.error('Failed to load referrals:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReferrals();
  }, [agent]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    toast.success('Referral link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Join me as an official News Agent on Daily Bharat! Report local stories from your area: ${referralUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(
      `Become an official News Agent on Daily Bharat: ${referralUrl}`
    );
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${text}`, '_blank');
  };

  const stats = {
    total: referrals.length,
    verified: referrals.filter((r) => r.status === 'verified' || r.status === 'rewarded').length,
    pending: referrals.filter((r) => r.status === 'pending').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">Referral Dashboard</h1>
        <p className="text-xs text-slate-500">Invite local reporters & contributors to join the Daily Bharat agent network.</p>
      </div>

      {/* Referral Link Box */}
      <div className="bg-gradient-to-r from-[#0891B2] to-[#0EA5E9] text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold">
            <Share2 size={20} />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg">Your Unique Agent Referral Code: {agent.referral_code}</h2>
            <p className="text-xs text-cyan-100">Share your link to invite new agent applicants.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20">
          <input
            type="text"
            readOnly
            value={referralUrl}
            className="w-full px-4 py-2.5 bg-transparent text-xs font-mono font-bold text-white focus:outline-none"
          />
          <button
            onClick={handleCopyLink}
            className="w-full sm:w-auto px-5 py-2.5 bg-white text-[#0891B2] font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 hover:bg-cyan-50 transition cursor-pointer shrink-0"
          >
            {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <span className="text-xs text-cyan-100 font-semibold">One-Click Share:</span>
          <button
            onClick={handleShareWhatsApp}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer"
          >
            <MessageSquare size={14} /> Share on WhatsApp
          </button>
          <button
            onClick={handleShareTelegram}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer"
          >
            <Send size={14} /> Share on Telegram
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500">Total Referrals</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 shadow-xs space-y-1">
          <span className="text-xs font-bold text-emerald-600">Successful / Approved</span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.verified}</p>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-amber-200 dark:border-amber-900/50 shadow-xs space-y-1">
          <span className="text-xs font-bold text-amber-600">Pending Review</span>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</p>
        </div>
      </div>

      {/* Referrals History Table */}
      <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <h3 className="font-serif font-bold text-slate-900 dark:text-white text-base mb-4">Referred Applicants History</h3>
        {loading ? (
          <p className="text-xs text-slate-400 text-center py-6">Loading referrals…</p>
        ) : referrals.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No referral signups recorded yet. Share your referral link to get started!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="pb-3">Referred User</th>
                  <th className="pb-3">Code Used</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {referrals.map((r) => (
                  <tr key={r.id}>
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">{r.referred_email || 'Applicant'}</td>
                    <td className="py-3 font-mono font-bold text-[#0891B2]">{r.referral_code}</td>
                    <td className="py-3 text-slate-500">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="py-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 uppercase">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default AgentReferralsPage;
