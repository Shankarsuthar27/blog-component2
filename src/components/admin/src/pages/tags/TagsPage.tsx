import React, { useState } from 'react';
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from '../../hooks/useTags';
import { DataTable } from '../../components/tables/DataTable';
import type { Column } from '../../components/tables/DataTable';
import { Plus, Edit2, Trash2, X, Hash, Loader2 } from 'lucide-react';
import type { Tag } from '../../types/admin';
import { slugify } from '../../utils/helpers';

export const TagsPage: React.FC = () => {
  const { data: tags = [], isLoading } = useTags();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();

  const [isOpen, setIsOpen] = useState(false);
  const [editTag, setEditTag] = useState<Tag | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  const handleOpen = (tag?: Tag) => {
    if (tag) {
      setEditTag(tag);
      setName(tag.name);
      setSlug(tag.slug);
    } else {
      setEditTag(null);
      setName('');
      setSlug('');
    }
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditTag(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const payload = { name: name.trim(), slug: slug || slugify(name) };

    if (editTag) {
      await updateTag.mutateAsync({ id: editTag.id, tag: payload });
    } else {
      await createTag.mutateAsync(payload);
    }
    handleClose();
  };

  const handleDelete = (tag: Tag) => {
    if (window.confirm(`Delete tag "${tag.name}"?`)) {
      deleteTag.mutate(tag.id);
    }
  };

  const isSaving = createTag.isPending || updateTag.isPending;

  const columns: Column<Tag>[] = [
    {
      key: 'name',
      header: 'Tag Name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
            <Hash size={13} />
          </div>
          <span className="font-semibold text-slate-900 dark:text-white">{row.name}</span>
        </div>
      )
    },
    {
      key: 'slug',
      header: 'Slug',
      render: (row) => (
        <span className="text-[10px] font-mono text-slate-400">#{row.slug}</span>
      )
    },
    {
      key: 'blog_count' as keyof Tag,
      header: 'Articles',
      render: (row) => (
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          {(row as any).blog_count || 0}
        </span>
      )
    },
    {
      key: 'id',
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-1.5">
          <button
            onClick={() => handleOpen(row)}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 rounded-lg transition cursor-pointer"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => handleDelete(row)}
            disabled={deleteTag.isPending}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-red-500 rounded-lg transition cursor-pointer"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">Tags</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create and manage article taxonomy tags.
          </p>
        </div>
        <button
          onClick={() => handleOpen()}
          className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/10 cursor-pointer"
        >
          <Plus size={16} /> Add Tag
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-cyan-500" size={32} />
        </div>
      )}

      {!isLoading && (
        <DataTable
          columns={columns}
          data={tags}
          getRowId={(row) => row.id}
        />
      )}

      {/* CRUD Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={handleClose} className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" />
          <form
            onSubmit={handleSave}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-sm relative z-10 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-950 dark:text-white">
                {editTag ? 'Edit Tag' : 'Create Tag'}
              </h3>
              <button type="button" onClick={handleClose} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!editTag) setSlug(slugify(e.target.value));
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-transparent rounded-xl text-xs focus:outline-none focus:bg-white focus:border-cyan-500 transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Slug</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-transparent rounded-xl text-xs focus:outline-none focus:bg-white focus:border-cyan-500 transition"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-60 text-slate-950 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5"
              >
                {isSaving && <Loader2 size={12} className="animate-spin" />}
                {editTag ? 'Save' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
export default TagsPage;
