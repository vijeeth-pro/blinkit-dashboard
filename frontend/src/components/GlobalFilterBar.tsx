import React, { memo } from 'react';
import { useFilters } from '../context/FilterContext';
import { useTheme } from '../context/ThemeContext';
import { Filter, RotateCcw } from 'lucide-react';

export const GlobalFilterBar: React.FC = memo(() => {
  const { filters, updateFilter, resetFilters } = useFilters();
  const { theme } = useTheme();

  const isDark = theme === 'dark';

  const handleReset = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    resetFilters();
  };

  return (
    <div className={`border rounded-xl p-3.5 mb-6 flex flex-wrap items-center justify-between gap-3 shadow-md transition-colors ${
      isDark
        ? 'bg-slate-900/80 border-slate-800 text-slate-200'
        : 'bg-white border-slate-200 text-slate-800 shadow-sm'
    }`}>
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Filter className="w-4 h-4 text-amber-500" />
        <span>Global Filters</span>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs">
        {/* Payment Method */}
        <div className="flex items-center gap-1.5">
          <label className={isDark ? 'text-slate-400 font-medium' : 'text-slate-600 font-medium'}>Payment:</label>
          <select
            value={filters.paymentMethod}
            onChange={e => updateFilter('paymentMethod', e.target.value)}
            className={`border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-slate-200'
                : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}
          >
            <option value="All">All Methods</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="UPI">UPI</option>
          </select>
        </div>

        {/* Delivery Status */}
        <div className="flex items-center gap-1.5">
          <label className={isDark ? 'text-slate-400 font-medium' : 'text-slate-600 font-medium'}>Delivery:</label>
          <select
            value={filters.deliveryStatus}
            onChange={e => updateFilter('deliveryStatus', e.target.value)}
            className={`border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-slate-200'
                : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}
          >
            <option value="All">All Statuses</option>
            <option value="On Time">On Time</option>
            <option value="Delayed">Delayed</option>
          </select>
        </div>

        {/* Customer Segment */}
        <div className="flex items-center gap-1.5">
          <label className={isDark ? 'text-slate-400 font-medium' : 'text-slate-600 font-medium'}>Segment:</label>
          <select
            value={filters.customerSegment}
            onChange={e => updateFilter('customerSegment', e.target.value)}
            className={`border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-slate-200'
                : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}
          >
            <option value="All">All Segments</option>
            <option value="Premium">Premium</option>
            <option value="Standard">Standard</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Reset Button */}
        <button
          type="button"
          onClick={handleReset}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-colors ml-auto cursor-pointer ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
});

GlobalFilterBar.displayName = 'GlobalFilterBar';
