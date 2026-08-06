import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Search, BookOpen, LayoutDashboard } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Blog', to: '/' },
  { label: 'Categories', to: '/categories' },
  { label: 'Contact', to: '/contact' },
];

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    return () => document.body.classList.remove('menu-open');
  }, [isMobileOpen]);

  // Focus search input when shown
  useEffect(() => {
    if (showSearch) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [showSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/?search=${encodeURIComponent(searchValue.trim())}`);
      setShowSearch(false);
      setSearchValue('');
    }
  };

  const closeMobile = () => setIsMobileOpen(false);

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm'
            : 'bg-white border-b border-transparent'
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-[70px] flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 shrink-0"
            onClick={closeMobile}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0891B2] to-[#06B6D4] flex items-center justify-center shadow-sm">
              <BookOpen size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-serif font-bold text-xl text-[#0F172A] tracking-tight">
              Daily <span className="text-[#0891B2]">Bharat</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                className={({ isActive }) =>
                  `relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive && link.to === '/'
                      ? 'text-[#0891B2] bg-cyan-50'
                      : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <Link
              to="/admin"
              className="w-9 h-9 md:w-auto md:h-auto flex items-center justify-center gap-2 rounded-lg text-[#64748B] hover:text-[#0891B2] hover:bg-cyan-50 md:border md:border-cyan-200/60 md:px-3.5 md:py-2 text-sm font-medium transition-colors"
              aria-label="Admin Dashboard"
              title="Admin Dashboard"
            >
              <LayoutDashboard size={18} />
              <span className="hidden md:inline">Admin Panel</span>
            </Link>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-[#64748B] hover:text-[#0891B2] hover:bg-cyan-50 transition-colors"
              aria-label="Search"
            >
              <Search size={18} />
            </button>
            <button
              className="hidden md:flex items-center gap-2 bg-[#0891B2] hover:bg-[#0e7490] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Subscribe
            </button>
            {/* Hamburger */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-[#0F172A] hover:bg-slate-100 transition-colors"
              aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileOpen}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isMobileOpen ? (
                  <motion.span
                    key="x"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X size={20} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu size={20} />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Search Bar (desktop) */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-slate-100 bg-white"
            >
              <form
                onSubmit={handleSearchSubmit}
                className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex gap-3"
              >
                <label htmlFor="header-search" className="sr-only">Search articles</label>
                <div className="relative flex-grow">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                  <input
                    ref={searchRef}
                    id="header-search"
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search articles, topics, authors…"
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm text-[#111827] placeholder-[#94A3B8] focus:outline-none focus:border-[#0891B2] focus:ring-2 focus:ring-[#0891B2]/20 transition"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#0891B2] hover:bg-[#0e7490] text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors shrink-0"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setShowSearch(false)}
                  className="text-[#64748B] hover:text-[#0F172A] text-sm px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 z-40 md:hidden"
              onClick={closeMobile}
            />
            {/* Menu panel */}
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 right-0 h-full w-72 bg-white z-50 md:hidden shadow-2xl flex flex-col"
              aria-label="Mobile navigation"
            >
              <div className="flex items-center justify-between px-5 h-[70px] border-b border-slate-100">
                <span className="font-serif font-bold text-[#0F172A]">Menu</span>
                <button
                  onClick={closeMobile}
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 text-[#64748B] transition-colors"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <NavLink
                      to={link.to}
                      onClick={closeMobile}
                      className={({ isActive }) =>
                        `block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                          isActive && link.to === '/'
                            ? 'bg-cyan-50 text-[#0891B2]'
                            : 'text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A]'
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  </motion.div>
                ))}
                {/* Admin Dashboard mobile shortcut */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: NAV_LINKS.length * 0.05 }}
                >
                  <Link
                    to="/admin"
                    onClick={closeMobile}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A]"
                  >
                    <LayoutDashboard size={18} className="shrink-0" />
                    <span>Admin Panel</span>
                  </Link>
                </motion.div>
              </div>
              <div className="p-5 border-t border-slate-100">
                <button className="w-full bg-[#0891B2] hover:bg-[#0e7490] text-white text-sm font-medium py-3 rounded-xl transition-colors">
                  Subscribe to Newsletter
                </button>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
};