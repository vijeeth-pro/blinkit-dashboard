import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, ShoppingBag, Store, FileSpreadsheet } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { path: '/', label: 'Executive Dashboard', icon: LayoutDashboard },
  { path: '/sales', label: 'Sales Analytics', icon: TrendingUp },
  { path: '/products', label: 'Product Analytics', icon: ShoppingBag },
  { path: '/outlets', label: 'Outlet Analytics', icon: Store },
  { path: '/reports', label: 'Reports & Export', icon: FileSpreadsheet },
];

export const Sidebar: React.FC = () => {
  const { theme } = useTheme();

  return (
    <aside className={`w-64 border-r flex flex-col justify-between p-4 h-screen sticky top-0 shrink-0 overflow-y-auto transition-colors ${
      theme === 'dark'
        ? 'bg-slate-900/90 border-slate-800 text-slate-100'
        : 'bg-white border-slate-200 text-slate-900 shadow-sm'
    }`}>
      <div>
        <div className={`flex items-center gap-3 px-3 py-4 mb-6 border-b ${
          theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-md">
            <span className="font-extrabold text-slate-950 text-xl tracking-tighter">b!</span>
          </div>
          <div>
            <h2 className="font-extrabold text-lg tracking-wide">blinkit</h2>
            <span className="text-xs text-amber-500 font-bold tracking-wider uppercase">BI Analytics</span>
          </div>
        </div>

        <nav className="space-y-1.5">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? theme === 'dark'
                        ? 'bg-amber-500/10 text-amber-400 border-l-4 border-amber-500 shadow-xs'
                        : 'bg-amber-50 text-amber-600 border-l-4 border-amber-500 font-bold shadow-xs'
                      : theme === 'dark'
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className={`p-3 rounded-xl border text-xs transition-colors mt-auto ${
        theme === 'dark'
          ? 'bg-slate-950/60 border-slate-800 text-slate-400'
          : 'bg-slate-50 border-slate-200 text-slate-600'
      }`}>
        <p className={`font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-800'}`}>PostgreSQL Live Sync</p>
        <p className="mt-1">103,340 analytical records aggregated in real-time.</p>
      </div>
    </aside>
  );
};
