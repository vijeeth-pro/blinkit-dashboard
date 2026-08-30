import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { useTheme } from '../context/ThemeContext';

interface DataPoint {
  category: string;
  totalSales: number;
  itemsSold: number;
}

interface D3CategoryBubbleChartProps {
  data: DataPoint[];
}

export const D3CategoryBubbleChart: React.FC<D3CategoryBubbleChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [hoveredCategory, setHoveredCategory] = useState<DataPoint | null>(null);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const totalSalesAll = useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.totalSales, 0);
  }, [data]);

  const colorMap: Record<string, string> = {
    'Pharmacy': '#6366f1',
    'Pet Care': '#ec4899',
    'Snacks & Munchies': '#14b8a6',
    'Instant & Frozen Food': '#f59e0b',
    'Dairy & Breakfast': '#8b5cf6',
    'Household Care': '#3b82f6',
    'Baby Care': '#10b981',
    'Personal Care': '#f43f5e',
    'Grocery & Staples': '#06b6d4',
    'Drinks & Juices': '#a855f7',
  };

  const getCategoryColor = (cat: string) => {
    return colorMap[cat] || '#f59e0b';
  };

  // Split category names into 2 clean lines for compact circle fitting
  const formatCategoryLines = (categoryName: string): [string, string] => {
    const parts = categoryName.split(' ');
    if (parts.length === 1) return [parts[0], ''];
    if (parts.length === 2) return [parts[0], parts[1]];
    if (parts.length === 3) return [`${parts[0]} ${parts[1]}`, parts[2]];
    if (parts.length >= 4) return [`${parts[0]} ${parts[1]}`, parts.slice(2).join(' ')];
    return [categoryName, ''];
  };

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const viewBoxWidth = 560;
    const viewBoxHeight = 340;
    const margin = 20;

    svg.attr('viewBox', `0 0 ${viewBoxWidth} ${viewBoxHeight}`);

    // D3 Pack Layout
    const pack = d3
      .pack()
      .size([viewBoxWidth - margin * 2, viewBoxHeight - margin * 2])
      .padding(8);

    const root = d3
      .hierarchy<{ name: string; value?: number; children?: any[] }>({
        name: 'root',
        children: data.map(d => ({ name: d.category, value: d.totalSales, itemsSold: d.itemsSold })),
      })
      .sum(d => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const nodes = pack(root as any).leaves();

    const containerGroup = svg
      .append('g')
      .attr('transform', `translate(${margin}, ${margin})`);

    const nodeGroup = containerGroup
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .style('cursor', 'pointer');

    // Bubble Circles with Solid Color Fill
    nodeGroup
      .append('circle')
      .attr('r', 0)
      .attr('fill', d => getCategoryColor(d.data.name))
      .attr('stroke', isDark ? '#0f172a' : '#ffffff')
      .attr('stroke-width', 2.5)
      .transition()
      .duration(700)
      .ease(d3.easeCubicOut)
      .attr('r', d => d.r);

    // Multi-line Wrapped Text Element
    nodeGroup.each(function (d) {
      const g = d3.select(this);
      const [line1, line2] = formatCategoryLines(d.data.name);
      const fontSize = Math.max(9, Math.min(d.r / 3.8, 11));

      const textEl = g
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('fill', '#ffffff')
        .attr('font-size', `${fontSize}px`)
        .attr('font-weight', '800')
        .style('pointer-events', 'none')
        .style('text-shadow', '0 1.5px 3px rgba(0,0,0,0.85)')
        .style('opacity', 0);

      if (line2) {
        textEl.append('tspan').attr('x', 0).attr('dy', '-0.7em').text(line1);
        textEl.append('tspan').attr('x', 0).attr('dy', '1.1em').text(line2);
        textEl
          .append('tspan')
          .attr('x', 0)
          .attr('dy', '1.2em')
          .attr('fill', '#fef08a')
          .attr('font-size', `${fontSize * 0.9}px`)
          .attr('font-weight', '700')
          .text(`₹${((d.data.value || 0) / 100000).toFixed(1)}L`);
      } else {
        textEl.append('tspan').attr('x', 0).attr('dy', '-0.3em').text(line1);
        textEl
          .append('tspan')
          .attr('x', 0)
          .attr('dy', '1.2em')
          .attr('fill', '#fef08a')
          .attr('font-size', `${fontSize * 0.9}px`)
          .attr('font-weight', '700')
          .text(`₹${((d.data.value || 0) / 100000).toFixed(1)}L`);
      }

      textEl
        .transition()
        .delay(250)
        .duration(350)
        .style('opacity', 1);
    });

    // Interactive Hover Scaling & Highlight
    nodeGroup
      .on('mouseover', function (event, d) {
        d3.select(this)
          .raise()
          .select('circle')
          .transition()
          .duration(150)
          .attr('stroke', '#f59e0b')
          .attr('stroke-width', 3.5)
          .attr('transform', 'scale(1.06)');

        const rawData = data.find(item => item.category === d.data.name);
        if (rawData) setHoveredCategory(rawData);
      })
      .on('mouseout', function () {
        d3.select(this)
          .select('circle')
          .transition()
          .duration(150)
          .attr('stroke', isDark ? '#0f172a' : '#ffffff')
          .attr('stroke-width', 2.5)
          .attr('transform', 'scale(1)');

        setHoveredCategory(null);
      });
  }, [data, isDark]);

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Dynamic Header Banner on Hover */}
      <div className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
        isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
          <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {hoveredCategory ? hoveredCategory.category : 'Category Density Overview'}
          </span>
        </div>

        <div className="text-xs">
          {hoveredCategory ? (
            <span className="font-semibold">
              Revenue: <strong className="text-emerald-500 font-mono">{formatCurrency(hoveredCategory.totalSales)}</strong>{' '}
              <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                ({((hoveredCategory.totalSales / (totalSalesAll || 1)) * 100).toFixed(1)}% Share)
              </span>
            </span>
          ) : (
            <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Hover over circles to inspect category metrics
            </span>
          )}
        </div>
      </div>

      {/* SVG Container with Solid Color Bubble Circles */}
      <div className="w-full flex justify-center items-center overflow-hidden">
        <svg ref={svgRef} className="w-full max-h-[340px] overflow-visible"></svg>
      </div>
    </div>
  );
};
