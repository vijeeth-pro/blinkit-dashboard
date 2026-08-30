import React from 'react';
import { Database, UserCircle, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const TopNav: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  const handleToggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    toggleTheme();
  };

  return (
    <header className={`h-16 border-b px-6 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md transition-colors ${
      theme === 'dark'
        ? 'bg-slate-900/80 border-slate-800/80 text-slate-100'
        : 'bg-white/90 border-slate-200 text-slate-900 shadow-xs'
    }`}>
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold tracking-tight">Business Intelligence Platform</h1>
        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1.5 border ${
          theme === 'dark'
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            : 'bg-emerald-50 text-emerald-700 border-emerald-300'
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Live PostgreSQL Engine
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs">
        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={handleToggleTheme}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all hover:scale-105 shadow-xs cursor-pointer ${
            theme === 'dark'
              ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300'
          }`}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600" />
              <span>Dark Mode</span>
            </>
          )}
        </button>

        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${
          theme === 'dark'
            ? 'bg-slate-950/80 border-slate-800 text-slate-400'
            : 'bg-slate-100 border-slate-200 text-slate-600'
        }`}>
          <Database className="w-3.5 h-3.5 text-amber-500" />
          <span>DB: <strong className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>blinkit_db</strong></span>
        </div>
        <div className={`flex items-center gap-2 font-medium text-xs ${
          theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
        }`}>
          <UserCircle className="w-5 h-5 text-slate-400" />
          <span>Business Manager</span>
        </div>
      </div>
    </header>
  );
};
