import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, BookOpen, Plus, FolderTree, Hash, MessageSquare, Mail, BarChart3, Settings, User, Command, ArrowRight, Moon, Sun, X
} from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Navigation' | 'Actions' | 'Preferences';
  icon: React.ReactNode;
  action: () => void;
}

export const CommandPalette: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useUIStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const items: CommandItem[] = [
    {
      id: 'nav-dashboard',
      title: 'Dashboard Overview',
      subtitle: 'Main control room & metrics',
      category: 'Navigation',
      icon: <BookOpen size={16} className="text-cyan-500" />,
      action: () => { navigate('/admin'); onClose(); },
    },
    {
      id: 'act-new-blog',
      title: 'Create New Article',
      subtitle: 'Open post editor',
      category: 'Actions',
      icon: <Plus size={16} className="text-emerald-500" />,
      action: () => { navigate('/admin/blogs/new'); onClose(); },
    },
    {
      id: 'nav-blogs',
      title: 'All Articles',
      subtitle: 'Manage published & draft blogs',
      category: 'Navigation',
      icon: <BookOpen size={16} className="text-blue-500" />,
      action: () => { navigate('/admin/blogs'); onClose(); },
    },
    {
      id: 'nav-categories',
      title: 'Categories',
      subtitle: 'Taxonomy folders & badge colors',
      category: 'Navigation',
      icon: <FolderTree size={16} className="text-violet-500" />,
      action: () => { navigate('/admin/categories'); onClose(); },
    },
    {
      id: 'nav-tags',
      title: 'Tags',
      subtitle: 'Keywords & article tags',
      category: 'Navigation',
      icon: <Hash size={16} className="text-indigo-500" />,
      action: () => { navigate('/admin/tags'); onClose(); },
    },
    {
      id: 'nav-comments',
      title: 'Comments Moderation',
      subtitle: 'Review & approve reader comments',
      category: 'Navigation',
      icon: <MessageSquare size={16} className="text-amber-500" />,
      action: () => { navigate('/admin/comments'); onClose(); },
    },
    {
      id: 'nav-newsletter',
      title: 'Newsletter Subscribers',
      subtitle: 'Mailing list & CSV export',
      category: 'Navigation',
      icon: <Mail size={16} className="text-pink-500" />,
      action: () => { navigate('/admin/newsletter'); onClose(); },
    },
    {
      id: 'nav-analytics',
      title: 'Reporting & Analytics',
      subtitle: 'Traffic trends & category distribution',
      category: 'Navigation',
      icon: <BarChart3 size={16} className="text-cyan-500" />,
      action: () => { navigate('/admin/analytics'); onClose(); },
    },
    {
      id: 'nav-settings',
      title: 'System Settings',
      subtitle: 'Website parameters & SEO tags',
      category: 'Navigation',
      icon: <Settings size={16} className="text-slate-400" />,
      action: () => { navigate('/admin/settings'); onClose(); },
    },
    {
      id: 'nav-profile',
      title: 'My Profile',
      subtitle: 'Account details & password',
      category: 'Navigation',
      icon: <User size={16} className="text-emerald-500" />,
      action: () => { navigate('/admin/profile'); onClose(); },
    },
    {
      id: 'pref-theme',
      title: darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      subtitle: 'Toggle application theme',
      category: 'Preferences',
      icon: darkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-indigo-400" />,
      action: () => { toggleDarkMode(); onClose(); },
    },
  ];

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(query.toLowerCase()))
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredItems, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden relative z-10"
        >
          {/* Search Header */}
          <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 gap-3">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search..."
              className="w-full bg-transparent text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X size={16} />
            </button>
          </div>

          {/* Results List */}
          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            {filteredItems.length === 0 && (
              <div className="py-10 text-center text-xs text-slate-400 font-medium">
                No matching commands found.
              </div>
            )}

            {filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-2xl cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'bg-cyan-50 dark:bg-cyan-950/40 text-slate-900 dark:text-white border border-cyan-200/50 dark:border-cyan-800/40'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-xl border shrink-0 ${
                      isSelected
                        ? 'bg-white dark:bg-slate-800 border-cyan-300 dark:border-cyan-700'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800'
                    }`}>
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate leading-snug">{item.title}</p>
                      {item.subtitle && (
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-cyan-600 dark:text-cyan-400 shrink-0">
                      <span>Execute</span>
                      <ArrowRight size={12} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer Shortcuts hint */}
          <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <div className="flex items-center gap-3">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>ESC Close</span>
            </div>
            <div className="flex items-center gap-1">
              <Command size={10} /> + K
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
