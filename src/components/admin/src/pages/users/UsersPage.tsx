import React from 'react';
import { DataTable } from '../../components/tables/DataTable';
import type { Column } from '../../components/tables/DataTable';
import { Mail, Loader2 } from 'lucide-react';
import { useProfiles, useUpdateUserRole } from '../../hooks/useProfiles';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase/client';
import type { Profile } from '../../types/admin';

export const UsersPage: React.FC = () => {
  const { data: profiles = [], isLoading } = useProfiles();
  const updateRole = useUpdateUserRole();

  const handleToggleStatus = async (profile: Profile) => {
    // Note: Supabase Auth user suspension requires service_role — for now we show UI only
    // In production, this would call a Supabase Edge Function with service_role key
    toast.success(`User ${profile.full_name} status toggled (requires service role API)`);
  };

  const columns: Column<Profile>[] = [
    {
      key: 'full_name',
      header: 'Staff Name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.avatar ? (
            <img src={row.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 text-xs font-bold">
              {(row.full_name || '?').charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <span className="font-semibold text-slate-900 dark:text-white block">{row.full_name || 'Unnamed'}</span>
            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
              <Mail size={10} /> {row.email}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role Assignment',
      render: (row) => (
        <select
          value={row.role}
          onChange={(e: any) => updateRole.mutate({ id: row.id, role: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-xl focus:outline-none cursor-pointer"
        >
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
          <option value="superadmin">Super Admin</option>
        </select>
      )
    },
    {
      key: 'created_at',
      header: 'Member Since',
      render: (row) => (
        <span className="text-xs text-slate-400">
          {new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      )
    },
    {
      key: 'id',
      header: 'Actions',
      render: (row) => (
        <button
          onClick={() => handleToggleStatus(row)}
          className="px-3 py-1.5 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          Manage Access
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">
            Users & Roles
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Authorize team contributors and modify database writing policies.
            {!isLoading && (
              <span className="ml-2 font-semibold text-cyan-600">{profiles.length} users</span>
            )}
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-cyan-500" size={32} />
        </div>
      )}

      {!isLoading && (
        <DataTable
          columns={columns}
          data={profiles}
          getRowId={(row) => row.id}
        />
      )}
    </div>
  );
};
export default UsersPage;
