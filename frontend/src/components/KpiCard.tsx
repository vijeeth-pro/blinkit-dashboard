import React, { memo } from 'react';
import { LucideIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badgeText?: string;
  badgeColor?: string;
}

export const KpiCard: React.FC<KpiCardProps> = memo(({
  title,
  value,
  subtitle,
  icon: Icon,
  badgeText,
  badgeColor,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const defaultBadgeColor = isDark
    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    : 'bg-emerald-50 text-emerald-700 border-emerald-300';

  return (
    <div className={`border rounded-xl p-5 shadow-lg relative overflow-hidden group transition-all ${
      isDark
        ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
        : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {title}
        </span>
        <div className={`p-2.5 rounded-lg transition-colors ${
          isDark
            ? 'bg-slate-800/80 text-amber-400 group-hover:bg-amber-500/10'
            : 'bg-amber-50 text-amber-600 group-hover:bg-amber-100'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <h3 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</h3>
        {badgeText && (
          <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${badgeColor || defaultBadgeColor}`}>
            {badgeText}
          </span>
        )}
      </div>

      {subtitle && <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{subtitle}</p>}
    </div>
  );
});

KpiCard.displayName = 'KpiCard';
