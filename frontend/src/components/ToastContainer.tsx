import React, { useEffect, useState } from 'react';
import { subscribeToastEvents, ToastMessage } from '../services/api';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const unsubscribe = subscribeToastEvents((newToast) => {
      setToasts(prev => [newToast, ...prev].slice(0, 4));

      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, 3500);
    });
    return unsubscribe;
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        const bgClass = isDark
          ? isSuccess
            ? 'bg-slate-900/95 border-emerald-500/40 text-emerald-300'
            : isError
              ? 'bg-slate-900/95 border-red-500/40 text-red-300'
              : 'bg-slate-900/95 border-amber-500/40 text-amber-300'
          : isSuccess
            ? 'bg-white border-emerald-400 text-emerald-900 shadow-md'
            : isError
              ? 'bg-white border-red-400 text-red-900 shadow-md'
              : 'bg-white border-amber-400 text-amber-900 shadow-md';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto border rounded-xl p-3.5 shadow-xl backdrop-blur-md flex items-start gap-3 transition-all duration-300 ${bgClass}`}
          >
            <div className="mt-0.5 shrink-0">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              {isError && <AlertTriangle className="w-5 h-5 text-red-500" />}
              {!isSuccess && !isError && <Info className="w-5 h-5 text-amber-500" />}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>{toast.title}</h4>
              <p className={`text-xs mt-0.5 leading-snug ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-200 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
