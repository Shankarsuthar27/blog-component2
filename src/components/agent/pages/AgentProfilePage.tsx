import React from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Agent } from '../../../types/agent';
import { Mail, Phone, Calendar, Award, CheckCircle2 } from 'lucide-react';

export const AgentProfilePage: React.FC = () => {
  const { agent } = useOutletContext<{ agent: Agent }>();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">Agent Profile Credentials</h1>
        <p className="text-xs text-slate-500">Official news agent record & identity badge.</p>
      </div>

      <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-slate-100 dark:border-slate-800 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#0891B2] to-[#0EA5E9] text-white text-2xl font-bold flex items-center justify-center shadow-lg shadow-[#0891B2]/20 shrink-0">
            {agent.full_name.charAt(0)}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">{agent.full_name}</h2>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                <CheckCircle2 size={12} /> Verified News Agent ✓
              </span>
            </div>

            <p className="text-xs font-mono font-bold text-[#0891B2]">
              Agent ID: {agent.agent_id} · Referral Code: {agent.referral_code}
            </p>
            <p className="text-xs text-slate-500">
              Coverage: {agent.city || 'Jalore'}, {agent.district || 'Jalore'} District, {agent.state || 'Rajasthan'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700 dark:text-slate-300">
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl space-y-2">
            <span className="font-bold text-slate-400 block uppercase tracking-wider text-[10px]">Contact Credentials</span>
            <p className="flex items-center gap-2 font-medium"><Mail size={14} className="text-[#0891B2]" /> {agent.email}</p>
            <p className="flex items-center gap-2 font-mono"><Phone size={14} className="text-[#0891B2]" /> {agent.phone}</p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl space-y-2">
            <span className="font-bold text-slate-400 block uppercase tracking-wider text-[10px]">Reporting Assignment</span>
            <p className="flex items-center gap-2 font-medium"><Award size={14} className="text-[#0891B2]" /> Category: {agent.category || 'Jalore News'}</p>
            <p className="flex items-center gap-2 text-slate-500"><Calendar size={14} className="text-[#0891B2]" /> Joined: {new Date(agent.joined_at || agent.created_at).toLocaleDateString('hi-IN', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        {agent.bio && (
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Reporter Bio</h3>
            <p className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {agent.bio}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
export default AgentProfilePage;
