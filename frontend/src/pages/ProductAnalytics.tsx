import React, { useState, useCallback } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchProductAnalytics } from '../services/api';
import { useFilters } from '../context/FilterContext';
import { useTheme } from '../context/ThemeContext';
import { exportPageToPdf } from '../utils/exportPdf';
import { ShoppingBag, ArrowUpDown, ArrowUp, ArrowDown, FileText } from 'lucide-react';
import { ProductPerformanceItem } from '../types/api';

export const ProductAnalytics: React.FC = () => {
  const { filters } = useFilters();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [sortBy, setSortBy] = useState<keyof ProductPerformanceItem>('totalRevenue');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [isExporting, setIsExporting] = useState(false);

  // Backend PostgreSQL server-side query with keepPreviousData for smooth in-place sorting
  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ['productAnalytics', filters, sortBy, sortOrder],
    queryFn: () => fetchProductAnalytics(filters, String(sortBy), sortOrder),
    placeholderData: keepPreviousData,
  });

  const handleSort = useCallback((column: keyof ProductPerformanceItem, e?: React.MouseEvent) => {
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
    await exportPageToPdf('page-product-analytics', 'product_analytics_report');
    setIsExporting(false);
  };

  const renderSortIcon = (column: keyof ProductPerformanceItem) => {
    if (sortBy !== column) return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60 hover:opacity-100" />;
    return sortOrder === 'ASC' ? <ArrowUp className="w-3 h-3 text-amber-500" /> : <ArrowDown className="w-3 h-3 text-amber-500" />;
  };

  // Only show initial full-page spinner if data is not yet loaded
  if (isLoading && !data) {
    return (
      <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="font-medium text-sm">Analyzing Blinkit product portfolio...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
        Failed to load product analytics.
      </div>
    );
  }

  const { topProducts, categoryMetrics } = data;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const cardStyle = `border rounded-xl p-5 shadow-lg transition-colors ${
    isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
  }`;

  return (
    <div id="page-product-analytics" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Product Analytics</h2>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Top-performing products, SKU margin analysis, and category revenue share.</p>
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

      {/* Category Performance Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categoryMetrics.map(cat => (
          <div key={cat.category} className={`border rounded-xl p-4 shadow-md transition-colors ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">{cat.category}</span>
              <span className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{cat.productCount} SKUs</span>
            </div>
            <p className={`text-lg font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(cat.totalRevenue)}</p>
            <div className={`flex justify-between items-center text-xs mt-2 border-t pt-2 ${
              isDark ? 'text-slate-400 border-slate-800/80' : 'text-slate-600 border-slate-100'
            }`}>
              <span>Avg Margin: <strong className="text-emerald-500">{cat.avgMargin}%</strong></span>
              <span>Avg Price: <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>₹{cat.avgPrice}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Top Products Leaderboard Table */}
      <div className={cardStyle}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <ShoppingBag className="w-4 h-4 text-amber-500" />
            Top Products Matrix
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
                <th className="p-3">Rank</th>
                <th className="p-3 cursor-pointer hover:text-amber-500 transition-colors" onClick={e => handleSort('productName', e)}>
                  <div className="flex items-center gap-1.5">
                    Product Name {renderSortIcon('productName')}
                  </div>
                </th>
                <th className="p-3 cursor-pointer hover:text-amber-500 transition-colors" onClick={e => handleSort('category', e)}>
                  <div className="flex items-center gap-1.5">
                    Category {renderSortIcon('category')}
                  </div>
                </th>
                <th className="p-3 cursor-pointer hover:text-amber-500 transition-colors" onClick={e => handleSort('brand', e)}>
                  <div className="flex items-center gap-1.5">
                    Brand {renderSortIcon('brand')}
                  </div>
                </th>
                <th className="p-3 cursor-pointer hover:text-amber-500 transition-colors" onClick={e => handleSort('price', e)}>
                  <div className="flex items-center gap-1.5">
                    Price {renderSortIcon('price')}
                  </div>
                </th>
                <th className="p-3 cursor-pointer hover:text-amber-500 transition-colors" onClick={e => handleSort('marginPercentage', e)}>
                  <div className="flex items-center gap-1.5">
                    Margin % {renderSortIcon('marginPercentage')}
                  </div>
                </th>
                <th className="p-3 cursor-pointer hover:text-amber-500 text-right transition-colors" onClick={e => handleSort('totalQuantitySold', e)}>
                  <div className="flex items-center justify-end gap-1.5">
                    Units Sold {renderSortIcon('totalQuantitySold')}
                  </div>
                </th>
                <th className="p-3 cursor-pointer hover:text-amber-500 text-right transition-colors" onClick={e => handleSort('totalRevenue', e)}>
                  <div className="flex items-center justify-end gap-1.5">
                    Total Revenue {renderSortIcon('totalRevenue')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y transition-opacity duration-200 ${isFetching ? 'opacity-60' : 'opacity-100'} ${
              isDark ? 'divide-slate-800/60' : 'divide-slate-200'
            }`}>
              {topProducts.map((prod, idx) => (
                <tr key={prod.productId} className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                  <td className="p-3 font-bold text-amber-500">#{idx + 1}</td>
                  <td className={`p-3 font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{prod.productName}</td>
                  <td className={`p-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{prod.category}</td>
                  <td className={`p-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{prod.brand}</td>
                  <td className="p-3 font-mono">₹{prod.price} <span className={`line-through ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>₹{prod.mrp}</span></td>
                  <td className="p-3 font-semibold text-emerald-500">{prod.marginPercentage}%</td>
                  <td className="p-3 text-right font-mono font-semibold">{prod.totalQuantitySold.toLocaleString()}</td>
                  <td className={`p-3 text-right font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(prod.totalRevenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
