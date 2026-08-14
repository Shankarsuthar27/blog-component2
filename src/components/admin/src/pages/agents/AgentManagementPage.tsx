import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  Search,
  Plus,
  UserMinus,
  Eye,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Sliders,
  Check,
  X,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../../../../lib/supabase/client';
import type { Agent, AgentRequest, AgentPermissions, AgentStatus } from '../../../../../types/agent';
import { motion, AnimatePresence } from 'framer-motion';

export const AgentManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('requests');
  const [requests, setRequests] = useState<AgentRequest[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [viewingRequest, setViewingRequest] = useState<AgentRequest | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<AgentRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [managingPermissionsAgent, setManagingPermissionsAgent] = useState<Agent | null>(null);

  // Manual Add Agent Form State
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addCity, setAddCity] = useState('Jalore');
  const [addDistrict, setAddDistrict] = useState('Jalore');
  const [addState, setAddState] = useState('Rajasthan');
  const [addCategory, setAddCategory] = useState('Jalore News');
  const [addCustomId, setAddCustomId] = useState('');

  // Permission Flags State for Modal
  const [permissionsState, setPermissionsState] = useState<AgentPermissions>({
    create_article: true,
    edit_article: true,
    delete_article: true,
    upload_media: true,
    submit_article: true,
    publish_article: false,
    edit_published_article: false,
    view_analytics: true,
    manage_profile: true,
    manage_referrals: true,
  });

  // Fetch Requests & Agents Data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: reqData, error: reqErr } = await supabase
        .from('agent_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (reqErr) throw reqErr;
      setRequests((reqData as AgentRequest[]) || []);

      const { data: agentData, error: agtErr } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (agtErr) throw agtErr;
      setAgents((agentData as Agent[]) || []);
    } catch (err: any) {
      console.error('Failed to fetch agent management data:', err);
      toast.error('Failed to load agent records.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Statistics
  const stats = useMemo(() => {
    const totalAgents = agents.length;
    const activeAgents = agents.filter((a) => a.status === 'active').length;
    const suspendedAgents = agents.filter((a) => a.status === 'suspended').length;
    const removedAgents = agents.filter((a) => a.status === 'removed').length;

    const pendingRequests = requests.filter((r) => r.status === 'pending').length;
    const rejectedRequests = requests.filter((r) => r.status === 'rejected').length;

    return { totalAgents, activeAgents, suspendedAgents, removedAgents, pendingRequests, rejectedRequests };
  }, [agents, requests]);

  // Auto-generate next Agent ID string e.g. AGT-0005
  const generateNextAgentId = () => {
    const count = agents.length + 1;
    return `AGT-${String(count).padStart(4, '0')}`;
  };

  // Auto-generate Referral Code e.g. AGT1024
  const generateReferralCode = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `AGT${randomNum}`;
  };

  // ── APPROVE AGENT REQUEST ───────────────────────────────────────────────────
  const handleApproveRequest = async (req: AgentRequest) => {
    if (!window.confirm(`Are you sure you want to approve ${req.full_name} as an Official News Agent?`)) return;

    const toastId = toast.loading('Approving agent application…');
    try {
      const newAgentId = generateNextAgentId();
      const newReferralCode = generateReferralCode();

      // 1. Create/Update Profile role = 'agent' in Supabase Profiles
      if (req.user_id) {
        await supabase
          .from('profiles')
          .update({ role: 'agent', full_name: req.full_name, phone: req.phone })
          .eq('id', req.user_id);
      }

      // 2. Insert Agent Record into `agents` table
      const { data: createdAgent, error: agtErr } = await supabase
        .from('agents')
        .insert([
          {
            user_id: req.user_id || req.id,
            agent_id: newAgentId,
            full_name: req.full_name,
            email: req.email,
            phone: req.phone,
            avatar_url: req.profile_photo || null,
            city: req.city,
            district: req.district,
            state: req.state,
            address: req.address,
            category: req.news_category || 'Jalore News',
            status: 'active',
            referral_code: newReferralCode,
          },
        ])
        .select()
        .single();

      if (agtErr) throw agtErr;

      // 3. Insert default permissions
      if (createdAgent?.id) {
        await supabase.from('agent_permissions').insert([
          {
            agent_id: createdAgent.id,
            create_article: true,
            edit_article: true,
            delete_article: true,
            upload_media: true,
            submit_article: true,
            publish_article: false,
            edit_published_article: false,
            view_analytics: true,
            manage_profile: true,
            manage_referrals: true,
          },
        ]);
      }

      // 4. Update request status to 'approved'
      await supabase
        .from('agent_requests')
        .update({ status: 'approved', reviewed_at: new Date().toISOString() })
        .eq('id', req.id);

      // 5. Send notification
      if (req.user_id) {
        await supabase.from('notifications').insert([
          {
            user_id: req.user_id,
            title: 'Agent Application Approved 🎉',
            message: `Congratulations! Your news agent application for ${req.district} has been approved. Your Agent ID is ${newAgentId}.`,
            type: 'application_approved',
          },
        ]);
      }

      toast.success(`Agent ${req.full_name} approved! Assigned ID: ${newAgentId}`, { id: toastId });
      setViewingRequest(null);
      fetchData();
    } catch (err: any) {
      console.error('Approval failed:', err);
      toast.error(`Approval failed: ${err.message}`, { id: toastId });
    }
  };

  // ── REJECT AGENT REQUEST ────────────────────────────────────────────────────
  const handleConfirmReject = async () => {
    if (!rejectingRequest) return;
    const toastId = toast.loading('Rejecting application…');

    try {
      const reason = rejectionReason.trim() || 'Application rejected because submitted credentials could not be verified.';

      await supabase
        .from('agent_requests')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', rejectingRequest.id);

      if (rejectingRequest.user_id) {
        await supabase.from('notifications').insert([
          {
            user_id: rejectingRequest.user_id,
            title: 'Agent Application Status Update',
            message: `Your agent application was not approved. Reason: ${reason}`,
            type: 'application_rejected',
          },
        ]);
      }

      toast.success('Agent request rejected.', { id: toastId });
      setRejectingRequest(null);
      setViewingRequest(null);
      setRejectionReason('');
      fetchData();
    } catch (err: any) {
      toast.error(`Rejection failed: ${err.message}`, { id: toastId });
    }
  };

  // ── MANUALLY CREATE AGENT ───────────────────────────────────────────────────
  const handleManualAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim() || !addEmail.trim() || !addPhone.trim()) {
      toast.error('Please fill in required fields.');
      return;
    }

    const toastId = toast.loading('Creating agent record…');
    try {
      const agentId = addCustomId.trim() || generateNextAgentId();
      const referralCode = generateReferralCode();

      const { data: created, error } = await supabase
        .from('agents')
        .insert([
          {
            user_id: gen_random_uuid_local(),
            agent_id: agentId,
            full_name: addName.trim(),
            email: addEmail.trim().toLowerCase(),
            phone: addPhone.trim(),
            city: addCity.trim(),
            district: addDistrict.trim(),
            state: addState.trim(),
            category: addCategory,
            status: 'active',
            referral_code: referralCode,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (created?.id) {
        await supabase.from('agent_permissions').insert([
          {
            agent_id: created.id,
            ...permissionsState,
          },
        ]);
      }

      toast.success(`Agent ${addName} created manually! Agent ID: ${agentId}`, { id: toastId });
      setShowAddModal(false);
      setAddName('');
      setAddEmail('');
      setAddPhone('');
      fetchData();
    } catch (err: any) {
      toast.error(`Failed to create agent: ${err.message}`, { id: toastId });
    }
  };

  const gen_random_uuid_local = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  // ── AGENT STATUS ACTIONS (Suspend / Remove / Activate) ──────────────────────
  const handleUpdateAgentStatus = async (agentId: string, newStatus: AgentStatus) => {
    const actionLabel = newStatus === 'removed' ? 'soft-remove' : newStatus;
    if (!window.confirm(`Are you sure you want to ${actionLabel} this agent?`)) return;

    try {
      const { error } = await supabase.from('agents').update({ status: newStatus }).eq('id', agentId);
      if (error) throw error;
      toast.success(`Agent status updated to ${newStatus}`);
      fetchData();
    } catch (err: any) {
      toast.error(`Failed: ${err.message}`);
    }
  };

  // ── LOAD & SAVE PERMISSIONS ──────────────────────────────────────────────────
  const openPermissionsModal = async (agent: Agent) => {
    setManagingPermissionsAgent(agent);
    try {
      const { data } = await supabase
        .from('agent_permissions')
        .select('*')
        .eq('agent_id', agent.id)
        .maybeSingle();

      if (data) {
        setPermissionsState(data as AgentPermissions);
      }
    } catch {
      // Use defaults if missing
    }
  };

  const handleSavePermissions = async () => {
    if (!managingPermissionsAgent) return;
    try {
      const { error } = await supabase
        .from('agent_permissions')
        .upsert([{ agent_id: managingPermissionsAgent.id, ...permissionsState }], { onConflict: 'agent_id' });

      if (error) throw error;
      toast.success(`Permissions updated for ${managingPermissionsAgent.full_name}`);
      setManagingPermissionsAgent(null);
    } catch (err: any) {
      toast.error(`Failed to save permissions: ${err.message}`);
    }
  };

  // ── FILTERED DATA ────────────────────────────────────────────────────────────
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (activeTab === 'requests' && r.status !== 'pending') return false;
      if (activeTab === 'rejected_req' && r.status !== 'rejected') return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          r.full_name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.phone.includes(q) ||
          r.city.toLowerCase().includes(q) ||
          r.district.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [requests, activeTab, searchTerm]);

  const filteredAgents = useMemo(() => {
    return agents.filter((a) => {
      if (activeTab === 'active' && a.status !== 'active') return false;
      if (activeTab === 'suspended' && a.status !== 'suspended') return false;
      if (activeTab === 'removed' && a.status !== 'removed') return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          a.full_name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.agent_id.toLowerCase().includes(q) ||
          a.referral_code.toLowerCase().includes(q) ||
          (a.city || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [agents, activeTab, searchTerm]);

  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full overflow-x-hidden">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#0891B2]/10 text-[#0891B2] flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Agent Management</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Review agent applications, assign roles, manage active agents, and set publishing permissions.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0891B2] to-[#0EA5E9] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#0891B2]/20 hover:opacity-95 transition cursor-pointer"
        >
          <Plus size={16} /> Add Agent Manually
        </button>
      </div>

      {/* ── Metric Summary Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Total Agents</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">{stats.totalAgents}</span>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-600 block">Active Agents</span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">{stats.activeAgents}</span>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-amber-200 dark:border-amber-900/50 shadow-2xs">
          <span className="text-[11px] font-semibold text-amber-600 block">Pending Applications</span>
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 block">{stats.pendingRequests}</span>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-rose-200 dark:border-rose-900/50 shadow-2xs">
          <span className="text-[11px] font-semibold text-rose-500 block">Suspended</span>
          <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 block">{stats.suspendedAgents}</span>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Rejected Requests</span>
          <span className="text-2xl font-bold text-slate-700 dark:text-slate-300 mt-1 block">{stats.rejectedRequests}</span>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 block">Removed Agents</span>
          <span className="text-2xl font-bold text-slate-400 mt-1 block">{stats.removedAgents}</span>
        </div>
      </div>

      {/* ── Filter Tabs & Search Bar ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-100 dark:border-slate-800">
          {[
            { id: 'requests', label: `Agent Requests (${stats.pendingRequests})` },
            { id: 'all', label: `All Agents (${stats.totalAgents})` },
            { id: 'active', label: `Active (${stats.activeAgents})` },
            { id: 'suspended', label: `Suspended (${stats.suspendedAgents})` },
            { id: 'rejected_req', label: `Rejected Requests (${stats.rejectedRequests})` },
            { id: 'removed', label: `Removed (${stats.removedAgents})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#0891B2] to-[#0EA5E9] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search applicants, agents by name, email, phone, city, or Agent ID…"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0891B2]"
          />
        </div>
      </div>

      {/* ── DATA TABLES SECTION ──────────────────────────────────────────────── */}
      {(activeTab === 'requests' || activeTab === 'rejected_req') ? (
        /* Agent Applications Table */
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Applicant Name</th>
                  <th className="py-3.5 px-4">Contact Details</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Applied Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">Loading applications…</td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">No applications matching current filter.</td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#0891B2]/10 text-[#0891B2] font-bold flex items-center justify-center shrink-0">
                            {req.full_name.charAt(0)}
                          </div>
                          <div>
                            <span>{req.full_name}</span>
                            {req.experience && <span className="block text-[10px] text-slate-400 font-normal truncate max-w-[150px]">{req.experience}</span>}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 space-y-0.5">
                        <p className="flex items-center gap-1"><Mail size={12} className="text-slate-400" /> {req.email}</p>
                        <p className="flex items-center gap-1 text-[11px] text-slate-500"><Phone size={11} className="text-slate-400" /> {req.phone}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="flex items-center gap-1 font-medium"><MapPin size={12} className="text-[#0891B2]" /> {req.city}, {req.district}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="bg-cyan-50 dark:bg-cyan-950/40 text-[#0891B2] dark:text-cyan-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-cyan-200/60">
                          {req.news_category || 'Jalore News'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {new Date(req.created_at).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                          req.status === 'pending' ? 'bg-amber-100 text-amber-700' : req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {req.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingRequest(req)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
                            title="View Details"
                          >
                            <Eye size={13} /> View
                          </button>

                          {req.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApproveRequest(req)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-2xs transition cursor-pointer"
                              >
                                <Check size={13} /> Approve
                              </button>

                              <button
                                onClick={() => setRejectingRequest(req)}
                                className="px-2 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                              >
                                <X size={13} /> Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Approved / Active / Suspended Agents Table */
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Agent ID & Name</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">District / City</th>
                  <th className="py-3.5 px-4">Referral Code</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">Loading agent accounts…</td>
                  </tr>
                ) : filteredAgents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">No agents match current tab filter.</td>
                  </tr>
                ) : (
                  filteredAgents.map((agt) => (
                    <tr key={agt.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0891B2] to-[#0EA5E9] text-white font-bold flex items-center justify-center shrink-0 shadow-2xs">
                            {agt.full_name.charAt(0)}
                          </div>
                          <div>
                            <span className="text-slate-900 dark:text-white font-bold block">{agt.full_name}</span>
                            <span className="text-[10px] font-mono font-bold text-[#0891B2] bg-cyan-50 dark:bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-200/50">
                              {agt.agent_id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 space-y-0.5">
                        <p className="flex items-center gap-1">{agt.email}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{agt.phone}</p>
                      </td>

                      <td className="py-3.5 px-4 font-medium">
                        <span className="flex items-center gap-1"><MapPin size={12} className="text-[#0891B2]" /> {agt.city || 'Jalore'}, {agt.district || 'Rajasthan'}</span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[#0891B2] font-bold">
                        {agt.referral_code}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {new Date(agt.joined_at || agt.created_at).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                          agt.status === 'active' ? 'bg-emerald-100 text-emerald-700' : agt.status === 'suspended' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {agt.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openPermissionsModal(agt)}
                            className="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-[#0891B2] dark:text-cyan-400 hover:bg-cyan-100 text-xs font-semibold flex items-center gap-1 transition"
                            title="Manage Permissions"
                          >
                            <Sliders size={13} /> Permissions
                          </button>

                          {agt.status === 'active' && (
                            <button
                              onClick={() => handleUpdateAgentStatus(agt.id, 'suspended')}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100 text-xs font-semibold transition cursor-pointer"
                            >
                              Suspend
                            </button>
                          )}

                          {agt.status === 'suspended' && (
                            <button
                              onClick={() => handleUpdateAgentStatus(agt.id, 'active')}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold transition cursor-pointer"
                            >
                              Activate
                            </button>
                          )}

                          {agt.status !== 'removed' && (
                            <button
                              onClick={() => handleUpdateAgentStatus(agt.id, 'removed')}
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-semibold transition cursor-pointer"
                              title="Soft Remove Agent"
                            >
                              <UserMinus size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── VIEW DETAILED APPLICATION MODAL ─────────────────────────────────── */}
      <AnimatePresence>
        {viewingRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#1E293B] rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">Agent Application Review</h3>
                  <p className="text-xs text-slate-500">Submitted on {new Date(viewingRequest.created_at).toLocaleString()}</p>
                </div>
                <button onClick={() => setViewingRequest(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><span className="font-bold text-slate-500">Applicant Name:</span> <span className="font-semibold text-slate-900 dark:text-white block">{viewingRequest.full_name}</span></div>
                  <div><span className="font-bold text-slate-500">Email:</span> <span className="font-mono block">{viewingRequest.email}</span></div>
                  <div><span className="font-bold text-slate-500">Mobile Phone:</span> <span className="font-mono block">{viewingRequest.phone}</span></div>
                  <div><span className="font-bold text-slate-500">Category:</span> <span className="font-semibold text-[#0891B2] block">{viewingRequest.news_category}</span></div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Location & Coverage Area</h4>
                  <p><span className="font-bold">City/Town:</span> {viewingRequest.city} | <span className="font-bold">District:</span> {viewingRequest.district} | <span className="font-bold">State:</span> {viewingRequest.state}</p>
                  {viewingRequest.locality && <p><span className="font-bold">Locality / Tehsil:</span> {viewingRequest.locality}</p>}
                  {viewingRequest.address && <p><span className="font-bold">Address:</span> {viewingRequest.address}</p>}
                </div>

                {viewingRequest.experience && (
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Prior Experience</h4>
                    <p className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">{viewingRequest.experience}</p>
                  </div>
                )}

                {viewingRequest.motivation && (
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Motivation & Reporting Plan</h4>
                    <p className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl leading-relaxed">{viewingRequest.motivation}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-4 pt-2">
                  {viewingRequest.social_profile && (
                    <a href={viewingRequest.social_profile} target="_blank" rel="noopener noreferrer" className="text-[#0891B2] font-semibold hover:underline flex items-center gap-1">
                      <ExternalLink size={13} /> View Social Profile
                    </a>
                  )}
                  {viewingRequest.document_url && (
                    <a href={viewingRequest.document_url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-semibold hover:underline flex items-center gap-1">
                      <FileText size={13} /> View Uploaded ID Document
                    </a>
                  )}
                </div>
              </div>

              {viewingRequest.status === 'pending' && (
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setRejectingRequest(viewingRequest)}
                    className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition cursor-pointer"
                  >
                    Reject Application
                  </button>
                  <button
                    onClick={() => handleApproveRequest(viewingRequest)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-semibold shadow-md transition cursor-pointer"
                  >
                    Approve as Official Agent
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── REJECTION REASON MODAL ────────────────────────────────────────────── */}
      <AnimatePresence>
        {rejectingRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white dark:bg-[#1E293B] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">Reject Agent Application</h3>
              <p className="text-xs text-slate-500">Provide an optional reason for rejecting {rejectingRequest.full_name}:</p>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Submitted ID credentials could not be verified."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-rose-500"
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button onClick={() => setRejectingRequest(null)} className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-100">Cancel</button>
                <button onClick={handleConfirmReject} className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 cursor-pointer">Confirm Rejection</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MANUALLY ADD AGENT MODAL ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white dark:bg-[#1E293B] rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">+ Add Agent Manually</h3>
                <button onClick={() => setShowAddModal(false)}><X size={18} className="text-slate-400" /></button>
              </div>

              <form onSubmit={handleManualAddAgent} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold block mb-1">Full Name *</label>
                    <input type="text" required value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="e.g. Ramesh Kumar" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl" />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Email *</label>
                    <input type="email" required value={addEmail} onChange={(e) => setAddEmail(e.target.value)} placeholder="ramesh@example.com" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold block mb-1">Mobile Phone *</label>
                    <input type="tel" required value={addPhone} onChange={(e) => setAddPhone(e.target.value)} placeholder="+91 9876543210" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl" />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Custom Agent ID (Optional)</label>
                    <input type="text" value={addCustomId} onChange={(e) => setAddCustomId(e.target.value)} placeholder="Auto-generated if blank" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold block mb-1">City</label>
                    <input type="text" value={addCity} onChange={(e) => setAddCity(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl" />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">District</label>
                    <input type="text" value={addDistrict} onChange={(e) => setAddDistrict(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl" />
                  </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold block mb-1">News Category</label>
                    <input type="text" value={addCategory} onChange={(e) => setAddCategory(e.target.value)} placeholder="e.g. Jalore News" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl" />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">State</label>
                    <input type="text" value={addState} onChange={(e) => setAddState(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl" />
                  </div>
                </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-600">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-[#0891B2] text-white font-bold rounded-xl cursor-pointer">Create Agent</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MANAGE PERMISSIONS MODAL ────────────────────────────────────────── */}
      <AnimatePresence>
        {managingPermissionsAgent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white dark:bg-[#1E293B] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">Manage Permissions</h3>
                  <p className="text-xs text-[#0891B2] font-semibold">{managingPermissionsAgent.full_name} ({managingPermissionsAgent.agent_id})</p>
                </div>
                <button onClick={() => setManagingPermissionsAgent(null)}><X size={18} className="text-slate-400" /></button>
              </div>

              <div className="space-y-3 text-xs">
                {Object.entries(permissionsState)
                  .filter(([key]) => key !== 'id' && key !== 'agent_id')
                  .map(([key, val]) => (
                    <label key={key} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl cursor-pointer">
                      <span className="font-medium text-slate-800 dark:text-slate-200 capitalize">{key.replace(/_/g, ' ')}</span>
                      <input
                        type="checkbox"
                        checked={Boolean(val)}
                        onChange={(e) => setPermissionsState((prev) => ({ ...prev, [key]: e.target.checked }))}
                        className="rounded text-[#0891B2]"
                      />
                    </label>
                  ))}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button onClick={() => setManagingPermissionsAgent(null)} className="px-4 py-2 text-slate-600">Cancel</button>
                <button onClick={handleSavePermissions} className="px-5 py-2 bg-[#0891B2] text-white font-bold rounded-xl cursor-pointer">Save Permissions</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default AgentManagementPage;
