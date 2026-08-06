import React from 'react';
import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  title: string;
  value: string | number;
  icon: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
  loading?: boolean;
}

export const StatCard: React.FC<Props> = ({ title, value, icon, trend, className, loading }) => {
  const IconComponent = (Icons as any)[icon];
  const Icon = IconComponent || Icons.HelpCircle;

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between min-h-[140px] animate-pulse">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="w-20 h-3 bg-slate-100 dark:bg-slate-800 rounded-full" />
            <div className="w-16 h-7 bg-slate-100 dark:bg-slate-800 rounded-lg" />
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="w-28 h-3 bg-slate-100 dark:bg-slate-800 rounded-full mt-4" />
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={`bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-[#D80408]/40 transition-all duration-300 flex flex-col justify-between min-h-[140px] group relative overflow-hidden ${className}`}
    >
      {/* Subtle cyan glow on hover */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#D80408]/5 rounded-full blur-xl group-hover:bg-[#D80408]/10 transition duration-300 pointer-events-none" />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-widest">{title}</p>
          <p className="text-2xl md:text-3xl font-bold font-serif text-[#0F172A] dark:text-white mt-2 leading-none">
            {value}
          </p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#ECFEFF] to-[#CFFAFE] dark:from-slate-800 dark:to-slate-800 flex items-center justify-center text-[#D80408] dark:text-cyan-400 ring-1 ring-[#D80408]/20 shadow-2xs shrink-0">
          <Icon size={20} />
        </div>
      </div>

      {trend && (
        <div className="flex items-center gap-1.5 mt-4 text-xs font-semibold relative z-10">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] ${
            trend.isPositive
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-[#10B981] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40'
              : 'bg-rose-50 dark:bg-rose-950/40 text-[#EF4444] dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40'
          }`}>
            {trend.isPositive ? (
              <Icons.TrendingUp size={12} />
            ) : (
              <Icons.TrendingDown size={12} />
            )}
            {trend.value}
          </span>
          <span className="text-[10px] text-[#64748B] dark:text-slate-500">vs last month</span>
        </div>
      )}
    </motion.div>
  );
};
