import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchSalesReport, getExportCsvUrl } from '../services/api';
import { useFilters } from '../context/FilterContext';
import { useTheme } from '../context/ThemeContext';
import { useDebounce } from '../hooks/useDebounce';
import { exportPageToPdf } from '../utils/exportPdf';
import { Download, ChevronLeft, ChevronRight, Search, ArrowUpDown, ArrowUp, ArrowDown, FileText } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { filters } = useFilters();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState('order_date');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [searchInput, setSearchInput] = useState('');
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Custom useDebounce hook (300ms delay) to debounce search query
  const debouncedSearch = useDebounce(searchInput, 300);

  const activeFilters = useMemo(
    () => ({
      ...filters,
      search: debouncedSearch,
    }),
    [filters, debouncedSearch]
  );

  // Backend PostgreSQL server-side query with keepPreviousData for smooth in-place sorting and pagination
  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ['salesReport', activeFilters, page, limit, sortBy, sortOrder],
    queryFn: () => fetchSalesReport(activeFilters, page, limit, sortBy, sortOrder),
    placeholderData: keepPreviousData,
  });

  const handleSort = useCallback((col: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setSortBy(prevCol => {
      if (prevCol === col) {
        setSortOrder(prev => (prev === 'ASC' ? 'DESC' : 'ASC'));
        return col;
      }
      setSortOrder('DESC');
      return col;
    });
    setPage(1);
  }, []);

  const handleExportCsv = (e: React.MouseEvent) => {
    e.preventDefault();
    const exportUrl = getExportCsvUrl(activeFilters);
    const link = document.createElement('a');
    link.href = exportUrl;
    link.download = 'blinkit_sales_report.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPdf = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsExportingPdf(true);
    await exportPageToPdf('page-reports', 'reports_page_ui');
    setIsExportingPdf(false);
  };

  const renderSortIcon = (column: string) => {
    if (sortBy !== column) return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60 hover:opacity-100" />;
    return sortOrder === 'ASC' ? <ArrowUp className="w-3 h-3 text-amber-500" /> : <ArrowDown className="w-3 h-3 text-amber-500" />;
  };

  const cardStyle = `border rounded-xl p-5 shadow-lg transition-colors ${
    isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
  }`;

  return (
    <div id="page-reports" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Reports & Data Export</h2>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Server-side paginated, sortable, and exportable order records.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* PDF Download Button */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg font-bold text-sm shadow-md transition-all shrink-0 cursor-pointer disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            <span>{isExportingPdf ? 'Generating PDF...' : 'Download UI (PDF)'}</span>
          </button>

          {/* Programmatic CSV Export Button */}
          <button
            type="button"
            onClick={handleExportCsv}
            className={`inline-flex items-center gap-2 border px-4 py-2 rounded-lg font-bold text-sm shadow-md transition-all shrink-0 cursor-pointer ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Controls (Search, Sort Order & Page Limit) */}
      <div className={`border rounded-xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4 transition-colors ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name or area..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className={`w-full text-xs rounded-lg pl-9 pr-3 py-2 border focus:outline-none focus:border-amber-500 ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Explicit ASC / DESC Sort Controls */}
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Order:</span>
            <div className={`flex items-center gap-1 border rounded-lg p-1 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
            }`}>
              <button
                type="button"
                onClick={e => {
                  e.preventDefault();
                  setSortOrder('ASC');
                  setPage(1);
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
                  setPage(1);
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

          <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            <span>Rows per page:</span>
            <select
              value={limit}
              onChange={e => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className={`border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Report Data Table */}
      <div className={cardStyle}>
        {isLoading && !data ? (
          <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="font-medium text-sm">Executing paginated SQL query...</p>
          </div>
        ) : isError || !data ? (
          <div className="p-4 text-red-400 text-sm">Failed to fetch report data.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className={`w-full text-left text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <thead className={`font-semibold uppercase tracking-wider border-b select-none ${
                  isDark ? 'bg-slate-950/80 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  <tr>
                    <th className="p-3 cursor-pointer hover:text-amber-500 transition-colors" onClick={e => handleSort('order_id', e)}>
                      <div className="flex items-center gap-1">
                        Order ID {renderSortIcon('order_id')}
                      </div>
                    </th>
                    <th className="p-3 cursor-pointer hover:text-amber-500 transition-colors" onClick={e => handleSort('customer_name', e)}>
                      <div className="flex items-center gap-1">
                        Customer Name {renderSortIcon('customer_name')}
                      </div>
                    </th>
                    <th className="p-3 cursor-pointer hover:text-amber-500 transition-colors" onClick={e => handleSort('customer_segment', e)}>
                      <div className="flex items-center gap-1">
                        Segment {renderSortIcon('customer_segment')}
                      </div>
                    </th>
                    <th className="p-3 cursor-pointer hover:text-amber-500 transition-colors" onClick={e => handleSort('area', e)}>
                      <div className="flex items-center gap-1">
                        Area {renderSortIcon('area')}
                      </div>
                    </th>
                    <th className="p-3 cursor-pointer hover:text-amber-500 transition-colors" onClick={e => handleSort('order_date', e)}>
                      <div className="flex items-center gap-1">
                        Order Date {renderSortIcon('order_date')}
                      </div>
                    </th>
                    <th className="p-3 cursor-pointer hover:text-amber-500 text-right transition-colors" onClick={e => handleSort('order_total', e)}>
                      <div className="flex items-center justify-end gap-1">
                        Total (INR) {renderSortIcon('order_total')}
                      </div>
                    </th>
                    <th className="p-3 cursor-pointer hover:text-amber-500 transition-colors" onClick={e => handleSort('payment_method', e)}>
                      <div className="flex items-center gap-1">
                        Payment {renderSortIcon('payment_method')}
                      </div>
                    </th>
                    <th className="p-3 cursor-pointer hover:text-amber-500 transition-colors" onClick={e => handleSort('delivery_status', e)}>
                      <div className="flex items-center gap-1">
                        Status {renderSortIcon('delivery_status')}
                      </div>
                    </th>
                    <th className="p-3 text-right">Delivery Time</th>
                    <th className="p-3 text-center">Rating</th>
                  </tr>
                </thead>
                <tbody className={`divide-y transition-opacity duration-200 ${isFetching ? 'opacity-60' : 'opacity-100'} ${
                  isDark ? 'divide-slate-800/60' : 'divide-slate-200'
                }`}>
                  {data.data.map(row => (
                    <tr key={row.orderId} className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                      <td className="p-3 font-mono font-bold text-amber-500">#{row.orderId}</td>
                      <td className={`p-3 font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{row.customerName || 'N/A'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                          isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {row.customerSegment || 'Standard'}
                        </span>
                      </td>
                      <td className={`p-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{row.area || 'Unknown'}</td>
                      <td className={`p-3 font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{row.orderDate}</td>
                      <td className={`p-3 text-right font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{parseFloat(row.orderTotal).toFixed(2)}</td>
                      <td className="p-3">{row.paymentMethod}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] border ${
                          row.deliveryStatus === 'On Time'
                            ? isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-700 border-red-300'
                        }`}>
                          {row.deliveryStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono">{row.deliveryTimeMinutes ? `${row.deliveryTimeMinutes} min` : 'N/A'}</td>
                      <td className="p-3 text-center font-bold text-amber-500">{row.rating ? `${row.rating} ★` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Server-Side Pagination Footer */}
            <div className={`flex items-center justify-between pt-4 mt-4 border-t text-xs ${
              isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'
            }`}>
              <div className="flex items-center gap-2">
                <span>Showing Page <strong className={isDark ? 'text-white' : 'text-slate-900'}>{data.pagination.page}</strong> of{' '}
                <strong className={isDark ? 'text-white' : 'text-slate-900'}>{data.pagination.totalPages}</strong> ({data.pagination.total.toLocaleString()} total records)</span>
                {isFetching && <span className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin ml-2"></span>}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={e => {
                    e.preventDefault();
                    setPage(prev => Math.max(prev - 1, 1));
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-colors border disabled:opacity-40 disabled:cursor-not-allowed ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  }`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </button>
                <button
                  type="button"
                  disabled={page >= data.pagination.totalPages}
                  onClick={e => {
                    e.preventDefault();
                    setPage(prev => Math.min(prev + 1, data.pagination.totalPages));
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-colors border disabled:opacity-40 disabled:cursor-not-allowed ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  }`}
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
