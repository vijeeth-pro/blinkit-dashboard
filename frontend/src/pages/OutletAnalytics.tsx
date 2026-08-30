import React, { useState, useCallback } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchOutletAnalytics } from '../services/api';
import { useFilters } from '../context/FilterContext';
import { useTheme } from '../context/ThemeContext';
import { exportPageToPdf } from '../utils/exportPdf';
import { Store, CheckCircle, AlertTriangle, ArrowUpDown, ArrowUp, ArrowDown, FileText } from 'lucide-react';
import { OutletPerformanceItem } from '../types/api';

export const OutletAnalytics: React.FC = () => {
  const { filters } = useFilters();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [sortBy, setSortBy] = useState<keyof OutletPerformanceItem>('totalSales');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [isExporting, setIsExporting] = useState(false);

  // Backend PostgreSQL server-side query with keepPreviousData for smooth in-place sorting
  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ['outletAnalytics', filters, sortBy, sortOrder],
    queryFn: () => fetchOutletAnalytics(filters, String(sortBy), sortOrder),
    placeholderData: keepPreviousData,
  });

  const handleSort = useCallback((column: keyof OutletPerformanceItem, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setSortBy(prevCol => {
      if (prevCol === column) {
        setSortOrder(prevOrder => (prevOrder === 'ASC' ? 'DESC' : 'ASC'));
        return column;
      }
      setSortOrder('DESC');
      return column;
    });
  }, []);

  const handleDownloadPdf = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsExporting(true);
    await exportPageToPdf('page-outlet-analytics', 'outlet_analytics_report');
    setIsExporting(false);
  };

  const renderSortIcon = (column: keyof OutletPerformanceItem) => {
    if (sortBy !== column) return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60 hover:opacity-100" />;
    return sortOrder === 'ASC' ? <ArrowUp className="w-3 h-3 text-amber-500" /> : <ArrowDown className="w-3 h-3 text-amber-500" />;
  };

  // Only show initial full-page spinner if data is not yet loaded
  if (isLoading && !data) {
    return (
      <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="font-medium text-sm">Evaluating dark store outlet statistics in PostgreSQL...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
        Failed to load outlet analytics.
      </div>
    );
  }

  const outlets = data.outlets || [];

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const cardStyle = `border rounded-xl p-5 shadow-lg transition-colors ${
    isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
  }`;

  return (
    <div id="page-outlet-analytics" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Outlet & Dark Store Analytics</h2>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Order fulfillment performance across all Blinkit fulfillment hubs.</p>
        </div>

        {/* PDF Download Button */}
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={isExporting}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg font-bold text-sm shadow-md transition-all shrink-0 cursor-pointer disabled:opacity-50"
        >
          <FileText className="w-4 h-4" />
          <span>{isExporting ? 'Generating PDF...' : 'Download UI (PDF)'}</span>
        </button>
      </div>

      <div className={cardStyle}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Store className="w-4 h-4 text-amber-500" />
            Dark Store Hub Matrix
            {isFetching && <span className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin ml-2"></span>}
          </h3>

          {/* ASC / DESC Sort Controls */}
          <div className="flex items-center gap-3">
            <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Sorted by <strong className="text-amber-500 uppercase">{String(sortBy)}</strong>:
            </span>
            <div className={`flex items-center gap-1 border rounded-lg p-1 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                type="button"
                onClick={e => {
                  e.preventDefault();
                  setSortOrder('ASC');
                }}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  sortOrder === 'ASC'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ASC ↑
              </button>
              <button
                type="button"
                onClick={e => {
                  e.preventDefault();
                  setSortOrder('DESC');
                }}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  sortOrder === 'DESC'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                DESC ↓
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className={`w-full text-left text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <thead className={`font-semibold uppercase tracking-wider border-b select-none ${
              isDark ? 'bg-slate-950/80 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              <tr>
                <th className="p-3 cursor-pointer hover:text-amber-500 transition-colors" onClick={e => handleSort('storeId', e)}>
                  <div className="flex items-center gap-1">
                    Store ID {renderSortIcon('storeId')}
                  </div>
                </th>
                <th className="p-3 cursor-pointer hover:text-amber-500 text-right transition-colors" onClick={e => handleSort('totalOrders', e)}>
                  <div className="flex items-center justify-end gap-1">
                    Total Orders {renderSortIcon('totalOrders')}
                  </div>
                </th>
                <th className="p-3 cursor-pointer hover:text-amber-500 text-right transition-colors" onClick={e => handleSort('totalSales', e)}>
                  <div className="flex items-center justify-end gap-1">
                    Total Sales {renderSortIcon('totalSales')}
                  </div>
                </th>
                <th className="p-3 cursor-pointer hover:text-amber-500 text-right transition-colors" onClick={e => handleSort('avgOrderValue', e)}>
                  <div className="flex items-center justify-end gap-1">
                    Avg Order Value {renderSortIcon('avgOrderValue')}
                  </div>
                </th>
                <th className="p-3 cursor-pointer hover:text-amber-500 text-right transition-colors" onClick={e => handleSort('avgDeliveryMinutes', e)}>
                  <div className="flex items-center justify-end gap-1">
                    Avg Delivery Time {renderSortIcon('avgDeliveryMinutes')}
                  </div>
                </th>
                <th className="p-3 cursor-pointer hover:text-amber-500 text-right transition-colors" onClick={e => handleSort('delayedOrdersPct', e)}>
                  <div className="flex items-center justify-end gap-1">
                    Delay Rate {renderSortIcon('delayedOrdersPct')}
                  </div>
                </th>
                <th className="p-3 text-center">Fulfillment Health</th>
              </tr>
            </thead>
            <tbody className={`divide-y transition-opacity duration-200 ${isFetching ? 'opacity-60' : 'opacity-100'} ${
              isDark ? 'divide-slate-800/60' : 'divide-slate-200'
            }`}>
              {outlets.map((st) => (
                <tr key={st.storeId} className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                  <td className="p-3 font-mono font-bold text-amber-500">Store #{st.storeId}</td>
                  <td className="p-3 text-right font-mono">{st.totalOrders.toLocaleString()}</td>
                  <td className={`p-3 text-right font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(st.totalSales)}</td>
                  <td className="p-3 text-right font-mono">₹{st.avgOrderValue}</td>
                  <td className={`p-3 text-right font-mono font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{st.avgDeliveryMinutes} mins</td>
                  <td className="p-3 text-right font-mono">
                    <span className={st.delayedOrdersPct > 25 ? 'text-red-500 font-bold' : isDark ? 'text-slate-400' : 'text-slate-500'}>
                      {st.delayedOrdersPct}%
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {st.delayedOrdersPct < 20 ? (
                      <span className={`inline-flex items-center gap-1 border px-2 py-0.5 rounded-full font-medium ${
                        isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      }`}>
                        <CheckCircle className="w-3 h-3" /> Excellent
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1 border px-2 py-0.5 rounded-full font-medium ${
                        isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-300'
                      }`}>
                        <AlertTriangle className="w-3 h-3" /> Monitor
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
