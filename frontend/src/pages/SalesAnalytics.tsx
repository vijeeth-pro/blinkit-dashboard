import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSalesAnalytics } from '../services/api';
import { useFilters } from '../context/FilterContext';
import { useTheme } from '../context/ThemeContext';
import { exportPageToPdf } from '../utils/exportPdf';
import { FileText } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const SalesAnalytics: React.FC = () => {
  const { filters } = useFilters();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['salesAnalytics', filters],
    queryFn: () => fetchSalesAnalytics(filters),
  });

  const handleDownloadPdf = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsExporting(true);
    await exportPageToPdf('page-sales-analytics', 'sales_analytics_report');
    setIsExporting(false);
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="font-medium text-sm">Aggregating PostgreSQL sales metrics...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
        Failed to load sales analytics.
      </div>
    );
  }

  const { monthlySales, deliveryPerformance } = data;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const cardStyle = `border rounded-xl p-5 shadow-lg transition-colors ${
    isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
  }`;

  const tooltipStyle = {
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    borderColor: isDark ? '#334155' : '#e2e8f0',
    borderRadius: '8px',
    color: isDark ? '#ffffff' : '#0f172a',
  };

  return (
    <div id="page-sales-analytics" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Sales Analytics</h2>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Detailed breakdown of monthly sales trends, delivery status, and order volumes.</p>
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

      {/* Monthly Sales Line Chart */}
      <div className={cardStyle}>
        <h3 className={`text-base font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Monthly Revenue & Order Volume</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlySales}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} />
              <XAxis dataKey="month" stroke={isDark ? '#64748b' : '#94a3b8'} tick={{ fontSize: 11 }} />
              <YAxis stroke={isDark ? '#64748b' : '#94a3b8'} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: any) => [formatCurrency(Number(value)), 'Total Sales']}
              />
              <Line type="monotone" dataKey="totalSales" stroke="#ec4899" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Delivery Performance Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={cardStyle}>
          <h3 className={`text-base font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Delivery Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deliveryPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} />
                <XAxis dataKey="deliveryStatus" stroke={isDark ? '#64748b' : '#94a3b8'} tick={{ fontSize: 11 }} />
                <YAxis stroke={isDark ? '#64748b' : '#94a3b8'} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={cardStyle}>
          <h3 className={`text-base font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Average Delivery Time (Mins)</h3>
          <div className="space-y-4">
            {deliveryPerformance.map(item => (
              <div key={item.deliveryStatus} className={`p-4 rounded-lg border flex items-center justify-between transition-colors ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <h4 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.deliveryStatus} Deliveries</h4>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Average Distance: {item.avgDistanceKm} km</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-amber-500">{item.avgTimeMinutes} min</span>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{item.count.toLocaleString()} orders</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
