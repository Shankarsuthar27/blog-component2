import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export const SearchWidget: React.FC<Props> = ({ value, onChange }) => {
  const [localValue, setLocalValue] = useState(value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange(localValue);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h3 className="font-serif font-bold text-[#0F172A] text-base mb-4">Search Articles</h3>
      <form onSubmit={handleSubmit} role="search">
        <label htmlFor="sidebar-search" className="sr-only">Search articles</label>
        <div className="relative flex gap-2">
          <div className="relative flex-grow">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
            />
            <input
              id="sidebar-search"
              type="text"
              value={localValue}
              onChange={(e) => {
                setLocalValue(e.target.value);
                if (e.target.value === '') onChange('');
              }}
              placeholder="Search…"
              className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm text-[#111827] placeholder-[#94A3B8] focus:outline-none focus:border-[#D80408] focus:ring-2 focus:ring-[#D80408]/20 transition"
            />
          </div>
          <button
            type="submit"
            className="bg-[#D80408] hover:bg-[#0e7490] text-white text-sm font-medium px-3 py-2.5 rounded-xl transition-colors shrink-0"
            aria-label="Submit search"
          >
            <Search size={15} />
          </button>
        </div>
      </form>
    </div>
  );
};
