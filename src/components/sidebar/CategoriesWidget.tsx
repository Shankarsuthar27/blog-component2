import React, { useEffect, useState } from 'react';
import { Tag } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  count: number;
}

interface Props {
  selectedCategory: string;
  onSelect: (category: string) => void;
}

export const CategoriesWidget: React.FC<Props> = ({ selectedCategory, onSelect }) => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const { data: cats, error: catErr } = await supabase
          .from('categories')
          .select('id, name, slug');

        if (catErr || !cats) {
          setCategories([]);
          setIsLoading(false);
          return;
        }

        const { data: blogs, error: blogErr } = await supabase
          .from('blogs')
          .select('category_id')
          .eq('status', 'published');

        const countMap: Record<string, number> = {};
        if (blogs) {
          blogs.forEach((b: any) => {
            if (b.category_id) {
              countMap[b.category_id] = (countMap[b.category_id] || 0) + 1;
            }
          });
        }

        const list = cats.map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          count: countMap[c.id] || 0,
        }));

        setCategories(list);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadCategories();
  }, []);

  if (isLoading || categories.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h3 className="font-serif font-bold text-[#0F172A] text-base mb-4">Categories</h3>
      <ul className="space-y-1" role="list">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.name;
          return (
            <li key={cat.id}>
              <button
                onClick={() => onSelect(isActive ? '' : cat.name)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-[#0891B2] text-white'
                    : 'text-[#64748B] hover:bg-cyan-50 hover:text-[#0891B2]'
                }`}
                aria-pressed={isActive}
              >
                <span className="flex items-center gap-2">
                  <Tag
                    size={13}
                    className={isActive ? 'text-white' : 'text-[#0891B2]'}
                  />
                  {cat.name}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-[#64748B] group-hover:bg-cyan-100 group-hover:text-[#0891B2]'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
