import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsUpDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyState?: React.ReactNode;
  bulkActions?: (selected: T[]) => React.ReactNode;
  onRowClick?: (row: T) => void;
  getRowId: (row: T) => string;
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyState,
  bulkActions,
  onRowClick,
  getRowId,
}: Props<T>) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Sorting logic
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;
    const sorted = [...data].sort((a: any, b: any) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDirection === 'asc' ? (aVal || 0) - (bVal || 0) : (bVal || 0) - (aVal || 0);
    });
    return sorted;
  }, [data, sortKey, sortDirection]);

  // Pagination logic
  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage]);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const toggleSelectAll = () => {
    if (selectedIds.length === data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.map(getRowId));
    }
  };

  const toggleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectedRows = data.filter((row) => selectedIds.includes(getRowId(row)));

  return (
    <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between transition duration-200">

      {/* Bulk Action Header bar */}
      {bulkActions && selectedIds.length > 0 && (
        <div className="bg-[#ECFEFF] dark:bg-cyan-950/30 border-b border-[#CFFAFE] dark:border-cyan-800/40 px-4 md:px-6 py-3.5 flex items-center justify-between animate-fade-in">
          <span className="text-xs font-semibold text-[#D80408] dark:text-cyan-400">
            {selectedIds.length} item{selectedIds.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            {bulkActions(selectedRows)}
          </div>
        </div>
      )}

      {/* Responsive Table Wrapper */}
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-[#F8FAFC] dark:bg-slate-900/80 border-b border-[#E2E8F0] dark:border-slate-800 text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
              {bulkActions && (
                <th className="py-3.5 px-4 md:px-6 w-12">
                  <input
                    type="checkbox"
                    checked={data.length > 0 && selectedIds.length === data.length}
                    onChange={toggleSelectAll}
                    className="rounded border-[#E2E8F0] text-[#D80408] focus:ring-[#D80408]/20 cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-3.5 px-4 md:px-6 ${col.sortable ? 'cursor-pointer select-none hover:text-[#0F172A] dark:hover:text-white transition' : ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && <ChevronsUpDown size={12} className="shrink-0 text-[#64748B]" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E2E8F0] dark:divide-slate-800 text-xs font-medium text-[#475569] dark:text-slate-300">
            {loading && (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map((col, j) => (
                    <td key={j} className="py-4 px-6">
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-md w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            )}

            {!loading && (
              <AnimatePresence>
                {paginatedData.map((row) => {
                  const id = getRowId(row);
                  const isSelected = selectedIds.includes(id);

                  return (
                    <motion.tr
                      key={id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => onRowClick && onRowClick(row)}
                      className={`hover:bg-[#F8FAFC] dark:hover:bg-slate-800/50 transition duration-150 cursor-pointer ${
                        isSelected ? 'bg-[#ECFEFF]/60 dark:bg-cyan-950/20' : ''
                      }`}
                    >
                      {bulkActions && (
                        <td
                          className="py-3.5 px-4 md:px-6 w-12"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectRow(id)}
                            className="rounded border-[#E2E8F0] text-[#D80408] focus:ring-[#D80408]/20 cursor-pointer"
                          />
                        </td>
                      )}
                      {columns.map((col) => (
                        <td key={col.key} className="py-3.5 px-4 md:px-6 max-w-xs md:max-w-sm truncate">
                          {col.render ? col.render(row) : (row as any)[col.key] || <span className="text-[#64748B]">—</span>}
                        </td>
                      ))}
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            )}
          </tbody>
        </table>

        {!loading && data.length === 0 && (
          <div className="py-14 flex flex-col items-center justify-center text-center">
            {emptyState || (
              <>
                <HelpCircle size={36} className="text-[#64748B] dark:text-slate-600 mb-3" />
                <p className="text-sm font-bold text-[#0F172A] dark:text-white">No records found</p>
                <p className="text-xs text-[#64748B] mt-1 max-w-xs">There are no items matching the selected criteria.</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Pagination Footer panel */}
      {totalPages > 1 && (
        <div className="border-t border-[#E2E8F0] dark:border-slate-800 px-4 md:px-6 py-3.5 flex items-center justify-between">
          <p className="text-[10px] font-semibold text-[#64748B] dark:text-slate-500 uppercase tracking-widest">
            Page {currentPage} of {totalPages} ({data.length} items)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-xl border border-[#E2E8F0] dark:border-slate-700 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F8FAFC] dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-xl border border-[#E2E8F0] dark:border-slate-700 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F8FAFC] dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default DataTable;
