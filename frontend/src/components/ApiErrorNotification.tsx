import React, { useEffect, useState } from 'react';
import { subscribeToastEvents, ToastMessage } from '../services/api';
import { AlertCircle, RefreshCw, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export const ApiErrorNotification: React.FC = () => {
  const [error, setError] = useState<{ message: string; isNetworkError: boolean } | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = subscribeToastEvents((toast: ToastMessage) => {
      if (toast.type === 'error') {
        setError({ message: toast.message, isNetworkError: toast.title.includes('Offline') });
      }
    });
    return unsubscribe;
  }, []);

  if (!error) return null;

  const handleRetry = () => {
    setError(null);
    queryClient.refetchQueries();
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md bg-red-950/95 border border-red-500/50 text-white p-4 rounded-xl shadow-2xl backdrop-blur-md flex flex-col gap-2 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>API Connection Alert</span>
        </div>
        <button onClick={() => setError(null)} className="text-slate-400 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-red-200 leading-relaxed">{error.message}</p>

      <div className="flex justify-end gap-2 mt-1">
        <button
          onClick={handleRetry}
          className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg font-bold transition-all shadow-md cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    </div>
  );
};
