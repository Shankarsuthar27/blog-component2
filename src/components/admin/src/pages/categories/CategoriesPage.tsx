import React, { useState } from 'react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../hooks/useCategories';
import { FolderTree, Plus, Edit2, Trash, X, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Category } from '../../types/admin';
import { slugify } from '../../utils/helpers';

export const CategoriesPage: React.FC = () => {
  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [isOpen, setIsOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [color, setColor] = useState('#06b6d4');
  const [description, setDescription] = useState('');

  const handleOpen = (cat?: Category) => {
    if (cat) {
      setEditCategory(cat);
      setName(cat.name);
      setSlug(cat.slug);
      setColor(cat.color);
      setDescription(cat.description || '');
    } else {
      setEditCategory(null);
      setName('');
      setSlug('');
      setColor('#06b6d4');
      setDescription('');
    }
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditCategory(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = { name: name.trim(), slug: slug || slugify(name), color, icon: 'FolderTree', description };

    if (editCategory) {
      await updateCategory.mutateAsync({ id: editCategory.id, cat: payload });
    } else {
      await createCategory.mutateAsync(payload);
    }
    handleClose();
  };

  const handleDelete = (cat: Category) => {
    if (window.confirm(`Delete "${cat.name}"? This cannot be undone.`)) {
      deleteCategory.mutate({ id: cat.id, name: cat.name });
    }
  };

  const isSaving = createCategory.isPending || updateCategory.isPending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">
            Categories
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure system directories, colors, and descriptions.
          </p>
        </div>
        <button
          onClick={() => handleOpen()}
          className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/10 cursor-pointer"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-cyan-500" size={32} />
        </div>
      )}

      {/* Grid List */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.length === 0 && (
            <div className="col-span-3 text-center py-16 text-slate-400 text-sm">
              No categories yet. Create your first one!
            </div>
          )}
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: cat.color }}
                  >
                    <FolderTree size={18} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                    {cat.blog_count || 0} Articles
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-950 dark:text-white">{cat.name}</h3>
                <p className="text-[10px] text-slate-400 font-mono mt-1">/{cat.slug}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed line-clamp-2">
                  {cat.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex gap-2 justify-end mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleOpen(cat)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 rounded-lg transition cursor-pointer"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  disabled={deleteCategory.isPending}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-red-500 rounded-lg transition cursor-pointer"
                >
                  <Trash size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CRUD dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={handleClose} className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" />

          <form
            onSubmit={handleSave}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl animate-fade-in space-y-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-950 dark:text-white">
                {editCategory ? 'Edit Category' : 'Create Category'}
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
                  if (!editCategory) setSlug(slugify(e.target.value));
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

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Color Badge</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                />
                <span className="text-xs font-mono font-semibold">{color}</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-transparent rounded-xl text-xs focus:outline-none focus:bg-white focus:border-cyan-500 transition resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-60 text-slate-950 text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
              >
                {isSaving && <Loader2 size={12} className="animate-spin" />}
                {editCategory ? 'Save' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}
    </motion.div>
  );
};
export default CategoriesPage;
