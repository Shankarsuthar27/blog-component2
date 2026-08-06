import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlogs, useDeleteBlog, useDuplicateBlog } from '../../hooks/useBlogs';
import { useCategories } from '../../hooks/useCategories';
import { DataTable } from '../../components/tables/DataTable';
import type { Column } from '../../components/tables/DataTable';
import { Plus, Search, Filter, Edit, Trash2, Copy, Star, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate } from '../../utils/helpers';
import type { Blog } from '../../types/admin';

export const BlogListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const navigate = useNavigate();

  const { data: blogs = [], isLoading } = useBlogs();
  const { data: categories = [] } = useCategories();
  const deleteBlog = useDeleteBlog();
  const duplicateBlog = useDuplicateBlog();

  // Search and filter operations
  const filteredBlogs = React.useMemo(() => {
    return blogs.filter((blog) => {
      const matchesSearch =
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !filterCategory || blog.category_id === filterCategory;
      const matchesStatus = !filterStatus || blog.status === filterStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [blogs, searchTerm, filterCategory, filterStatus]);

  const handleDuplicate = (post: Blog, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Duplicate "${post.title}"?`)) {
      duplicateBlog.mutate(post);
    }
  };

  const handleDelete = (blog: Blog, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${blog.title}"? This cannot be undone.`)) {
      deleteBlog.mutate({ id: blog.id, title: blog.title });
    }
  };

  const columns: Column<Blog>[] = [
    {
      key: 'featured_image',
      header: 'Cover',
      render: (row) => (
        <div className="w-12 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
          {row.featured_image ? (
            <img src={row.featured_image} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300 text-[9px]">No img</div>
          )}
        </div>
      )
    },
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (row) => (
        <div className="min-w-[200px]">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-900 dark:text-white line-clamp-1">{row.title}</span>
            {row.featured && <Star size={12} className="text-amber-500 fill-amber-500 shrink-0" />}
          </div>
          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">/{row.slug}</span>
        </div>
      )
    },
    {
      key: 'category_id',
      header: 'Category',
      render: (row) => {
        const cat = categories.find((c) => c.id === row.category_id);
        if (!cat) return <span className="text-slate-400">—</span>;
        return (
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
          >
            {cat.name}
          </span>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => (
        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${
          row.status === 'published'
            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
            : row.status === 'scheduled'
            ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/20'
            : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      key: 'views',
      header: 'Views',
      sortable: true,
      render: (row) => <span>{row.views.toLocaleString()}</span>
    },
    {
      key: 'published_at',
      header: 'Date',
      render: (row) => <span>{formatDate(row.published_at || row.created_at)}</span>
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/admin/blogs/edit/${row.id}`)}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-900 transition"
            title="Edit"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={(e) => handleDuplicate(row, e)}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-900 transition"
            title="Duplicate"
            disabled={duplicateBlog.isPending}
          >
            <Copy size={14} />
          </button>
          <button
            onClick={(e) => handleDelete(row, e)}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-red-500 transition"
            title="Delete"
            disabled={deleteBlog.isPending}
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">
            Article Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Write, review, publish, and schedule your editorial post list.
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/blogs/new')}
          className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/10 cursor-pointer"
        >
          <Plus size={16} /> New Article
        </button>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search articles by title or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-cyan-500 transition text-sm"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-2">
          <div className="relative shrink-0 flex-1 sm:flex-none">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full sm:w-auto pl-8 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 text-xs border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-cyan-500 appearance-none transition cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="relative shrink-0 flex-1 sm:flex-none">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto pl-8 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 text-xs border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-cyan-500 appearance-none transition cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-cyan-500" size={32} />
        </div>
      )}

      {/* Main List Table */}
      {!isLoading && (
        <DataTable
          columns={columns}
          data={filteredBlogs}
          getRowId={(row) => row.id}
          onRowClick={(row) => navigate(`/admin/blogs/edit/${row.id}`)}
        />
      )}
    </motion.div>
  );
};
export default BlogListPage;
