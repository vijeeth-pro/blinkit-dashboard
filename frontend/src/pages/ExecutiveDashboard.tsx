import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardSummary } from '../services/api';
import { useFilters } from '../context/FilterContext';
import { useTheme } from '../context/ThemeContext';
import { KpiCard } from '../components/KpiCard';
import { D3CategoryBubbleChart } from '../components/D3CategoryBubbleChart';
import { D3DonutChart } from '../components/D3DonutChart';
import { exportPageToPdf } from '../utils/exportPdf';
import {
  DollarSign,
  ShoppingCart,
  PackageCheck,
  TrendingUp,
  Star,
  Store,
  Boxes,
  Users,
  Calendar,
  Layers,
  FileText,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

export const ExecutiveDashboard: React.FC = () => {
  const { filters } = useFilters();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboardSummary', filters],
    queryFn: () => fetchDashboardSummary(filters),
  });

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const cardStyle = `border rounded-xl p-5 shadow-lg transition-colors ${
    isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
  }`;

  const handleDownloadPdf = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsExporting(true);
    await exportPageToPdf('page-executive-dashboard', 'executive_dashboard_report');
    setIsExporting(false);
  };

  // Custom rich tooltip for Daily Sales Trend
  const CustomSalesTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className={`p-3 rounded-xl border shadow-xl backdrop-blur-md text-xs space-y-1 ${
          isDark ? 'bg-slate-950/95 border-slate-800 text-white' : 'bg-white/95 border-slate-200 text-slate-900 shadow-lg'
        }`}>
          <div className="flex items-center gap-1.5 font-bold text-amber-500 pb-1 border-b border-slate-800/40">
            <Calendar className="w-3.5 h-3.5" />
            <span>{label}</span>
          </div>
          <div className="pt-1">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Daily Revenue: </span>
            <strong className="text-emerald-500 font-mono font-bold text-sm">{formatCurrency(dataPoint.sales)}</strong>
          </div>
          {dataPoint.orders && (
            <div>
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Total Orders: </span>
              <strong className="font-mono font-semibold">{dataPoint.orders.toLocaleString()} orders</strong>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom rich tooltip for Revenue by Category
  const CustomCategoryTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className={`p-3 rounded-xl border shadow-xl backdrop-blur-md text-xs space-y-1 ${
          isDark ? 'bg-slate-950/95 border-slate-800 text-white' : 'bg-white/95 border-slate-200 text-slate-900 shadow-lg'
        }`}>
          <div className="flex items-center gap-1.5 font-bold text-indigo-400 pb-1 border-b border-slate-800/40">
            <Layers className="w-3.5 h-3.5" />
            <span>{item.category}</span>
          </div>
          <div className="pt-1">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Category Revenue: </span>
            <strong className="text-emerald-500 font-mono font-bold text-sm">{formatCurrency(item.totalSales)}</strong>
          </div>
          {item.itemsSold && (
            <div>
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Units Sold: </span>
              <strong className="font-mono font-semibold">{item.itemsSold.toLocaleString()} items</strong>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="font-medium text-sm">Querying PostgreSQL & rendering D3 visualizations...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
        Failed to load executive summary data. Please ensure the backend server is running on port 5001.
      </div>
    );
  }

  const { summary, salesTrend, categorySales, paymentSales } = data;

  const peakSalesDay = salesTrend.reduce(
    (max, item) => (item.sales > max.sales ? item : max),
    salesTrend[0] || { sales: 0, date: '' }
  );

  return (
    <div id="page-executive-dashboard" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Executive Dashboard</h2>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Enterprise metrics powered by D3.js and Recharts data visualization.</p>
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

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Sales Revenue"
          value={formatCurrency(summary.totalSales)}
          subtitle="Gross merchandise value"
          icon={DollarSign}
          badgeText={`+${summary.salesGrowthPct}%`}
        />
        <KpiCard
          title="Total Orders"
          value={summary.totalOrders.toLocaleString()}
          subtitle="Orders processed"
          icon={ShoppingCart}
        />
        <KpiCard
          title="Items Sold"
          value={summary.totalItemsSold.toLocaleString()}
          subtitle="Total product units"
          icon={PackageCheck}
        />
        <KpiCard
          title="Avg Order Value (AOV)"
          value={formatCurrency(summary.avgOrderValue)}
          subtitle="Revenue per transaction"
          icon={TrendingUp}
        />
        <KpiCard
          title="Customer Rating"
          value={`${summary.avgRating} / 5.0`}
          subtitle="Feedback score"
          icon={Star}
          badgeText="Satisfactory"
        />
        <KpiCard
          title="Active Outlets"
          value={summary.totalOutlets}
          subtitle="Dark stores & hubs"
          icon={Store}
        />
        <KpiCard
          title="Products Catalog"
          value={summary.totalProducts}
          subtitle="SKUs available"
          icon={Boxes}
        />
        <KpiCard
          title="Total Customers"
          value={summary.totalCustomers.toLocaleString()}
          subtitle="Registered buyers"
          icon={Users}
        />
      </div>

      {/* Top Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Daily Sales Trend Chart */}
        <div className={`lg:col-span-2 ${cardStyle} flex flex-col justify-between`}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Daily Sales Trend</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Gross daily revenue timeline over selected filter window</p>
            </div>
            {peakSalesDay.sales > 0 && (
              <div className={`text-xs px-3 py-1 rounded-lg border font-medium ${
                isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-300'
              }`}>
                Peak: <strong>{formatCurrency(peakSalesDay.sales)}</strong> ({formatDateLabel(peakSalesDay.date)})
              </div>
            )}
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke={isDark ? '#64748b' : '#94a3b8'}
                  tick={{ fontSize: 11 }}
                  tickFormatter={formatDateLabel}
                  minTickGap={40}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke={isDark ? '#64748b' : '#94a3b8'}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomSalesTooltip />} />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fillOpacity={0.15}
                  fill="#f59e0b"
                  activeDot={{ r: 6, fill: '#f59e0b', stroke: isDark ? '#0f172a' : '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className={`text-xs flex items-center justify-between pt-3 border-t mt-2 ${
            isDark ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-200'
          }`}>
            <span>Showing 90-day PostgreSQL order dataset timeline.</span>
            <span className="font-semibold text-amber-500">Live PostgreSQL Feed</span>
          </div>
        </div>

        {/* D3.js Donut Chart */}
        <div className={`${cardStyle} flex flex-col justify-between`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Payment Methods</h3>
            <span className="text-[10px] font-bold tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase">
              D3 Engine
            </span>
          </div>
          <D3DonutChart data={paymentSales} />
          <div className={`text-xs text-center pt-2 border-t mt-2 ${isDark ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-200'}`}>
            Interactive D3 animated donut chart.
          </div>
        </div>
      </div>

      {/* Bottom Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* D3.js Category Bubble Chart */}
        <div className={`${cardStyle} flex flex-col justify-between`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Category Packing Density</h3>
            <span className="text-[10px] font-bold tracking-wider text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 uppercase">
              D3 Pack Layout
            </span>
          </div>
          <D3CategoryBubbleChart data={categorySales} />
        </div>

        {/* Category Revenue Bar Chart */}
        <div className={`${cardStyle} flex flex-col justify-between`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Revenue by Category</h3>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{categorySales.length} Categories</span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categorySales} margin={{ top: 15, right: 10, left: -10, bottom: 45 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} vertical={false} />
                <XAxis
                  dataKey="category"
                  stroke={isDark ? '#64748b' : '#94a3b8'}
                  tick={{ fontSize: 10, fill: isDark ? '#cbd5e1' : '#475569' }}
                  interval={0}
                  angle={-35}
                  textAnchor="end"
                />
                <YAxis
                  stroke={isDark ? '#64748b' : '#94a3b8'}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
                />
                <Tooltip content={<CustomCategoryTooltip />} />
                <Bar dataKey="totalSales" fill="#6366f1" radius={[6, 6, 0, 0]}>
                  {categorySales.map((entry, index) => (
                    <Cell key={`cell-${index}`} hover={{ fill: '#f59e0b' }} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={`text-xs flex items-center justify-between pt-3 border-t mt-2 ${
            isDark ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-200'
          }`}>
            <span>Ranked by gross sales volume.</span>
            <span className="font-semibold text-indigo-400">Total: {formatCurrency(categorySales.reduce((acc, c) => acc + c.totalSales, 0))}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
