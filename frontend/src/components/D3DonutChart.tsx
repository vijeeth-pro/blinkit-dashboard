import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { CreditCard, Wallet, Smartphone, Banknote } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface PaymentData {
  method: string;
  totalSales: number;
  orderCount: number;
  avgOrderValue?: number;
}

interface D3DonutChartProps {
  data: PaymentData[];
}

export const D3DonutChart: React.FC<D3DonutChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activeMethod, setActiveMethod] = useState<string | null>(null);

  const totalGrossSales = useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.totalSales, 0);
  }, [data]);

  const totalOrders = useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.orderCount, 0);
  }, [data]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const getMethodIcon = (method: string) => {
    const lower = method.toLowerCase();
    if (lower.includes('upi')) return <Smartphone className="w-3.5 h-3.5 text-emerald-500" />;
    if (lower.includes('card')) return <CreditCard className="w-3.5 h-3.5 text-indigo-500" />;
    if (lower.includes('cash') || lower.includes('cod')) return <Banknote className="w-3.5 h-3.5 text-amber-500" />;
    return <Wallet className="w-3.5 h-3.5 text-pink-500" />;
  };

  const getColor = (method: string) => {
    const lower = method.toLowerCase();
    if (lower.includes('upi')) return '#10b981';
    if (lower.includes('card')) return '#6366f1';
    if (lower.includes('cash') || lower.includes('cod')) return '#f59e0b';
    return '#ec4899';
  };

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 240;
    const height = 200;
    const radius = Math.min(width, height) / 2 - 10;

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const pie = d3
      .pie<PaymentData>()
      .value(d => d.totalSales)
      .sort(null);

    const arc = d3
      .arc<d3.PieArcDatum<PaymentData>>()
      .innerRadius(radius * 0.6)
      .outerRadius(radius)
      .cornerRadius(4);

    const arcHover = d3
      .arc<d3.PieArcDatum<PaymentData>>()
      .innerRadius(radius * 0.6)
      .outerRadius(radius + 8)
      .cornerRadius(4);

    const arcs = g
      .selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc')
      .style('cursor', 'pointer');

    arcs
      .append('path')
      .attr('fill', d => getColor(d.data.method))
      .attr('stroke', isDark ? '#0f172a' : '#ffffff')
      .attr('stroke-width', '2px')
      .attr('d', d => {
        if (activeMethod && d.data.method === activeMethod) {
          return arcHover(d) || '';
        }
        return arc(d) || '';
      })
      .on('mouseover', function (event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('d', arcHover as any);

        setActiveMethod(d.data.method);
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('d', arc as any);

        setActiveMethod(null);
      });
  }, [data, isDark, activeMethod]);

  const activeItem = useMemo(() => {
    return data.find(d => d.method === activeMethod) || null;
  }, [data, activeMethod]);

  const displayedTitle = activeItem ? activeItem.method : 'Total Sales';
  const displayedValue = activeItem ? formatCurrency(activeItem.totalSales) : formatCurrency(totalGrossSales);
  const displayedShare = activeItem
    ? `${((activeItem.totalSales / (totalGrossSales || 1)) * 100).toFixed(1)}% Share`
    : `${totalOrders.toLocaleString()} Orders`;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* SVG Donut Chart with Interactive Center Label */}
      <div className="relative flex justify-center items-center">
        <svg ref={svgRef} className="w-full max-h-[200px] overflow-visible"></svg>

        {/* Donut Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-2">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {displayedTitle}
          </span>
          <span className={`text-base font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {displayedValue}
          </span>
          <span className="text-[11px] font-semibold text-amber-500 mt-0.5">
            {displayedShare}
          </span>
        </div>
      </div>

      {/* Sleek, Unsquashed Payment Method List */}
      <div className="space-y-2">
        {data.map(item => {
          const pct = ((item.totalSales / (totalGrossSales || 1)) * 100).toFixed(1);
          const colorHex = getColor(item.method);
          const aov = item.avgOrderValue || (item.orderCount ? item.totalSales / item.orderCount : 0);
          const isSelected = activeMethod === item.method;

          return (
            <div
              key={item.method}
              onMouseEnter={() => setActiveMethod(item.method)}
              onMouseLeave={() => setActiveMethod(null)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? isDark
                    ? 'bg-slate-800/90 border-amber-500/50 shadow-md'
                    : 'bg-amber-50/80 border-amber-300 shadow-sm'
                  : isDark
                    ? 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40'
                    : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/80'
              }`}
            >
              {/* Row Header: Icon + Method Name | Revenue */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded-md ${isDark ? 'bg-slate-900' : 'bg-white shadow-xs'}`}>
                    {getMethodIcon(item.method)}
                  </div>
                  <span className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {item.method}
                  </span>
                </div>

                <div className="text-right">
                  <span className={`font-extrabold text-xs block ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                    {formatCurrency(item.totalSales)}
                  </span>
                </div>
              </div>

              {/* Progress Bar & Sub-Details */}
              <div className="w-full bg-slate-800/20 rounded-full h-1.5 overflow-hidden mb-1.5">
                <div
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${pct}%`, backgroundColor: colorHex }}
                ></div>
              </div>

              <div className={`flex justify-between items-center text-[10px] ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                <span>{item.orderCount.toLocaleString()} orders</span>
                <span>AOV: <strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>₹{Math.round(aov)}</strong></span>
                <span className="font-bold text-amber-500">{pct}% Share</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
