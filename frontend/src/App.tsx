import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FilterProvider } from './context/FilterContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { GlobalFilterBar } from './components/GlobalFilterBar';
import { ApiErrorNotification } from './components/ApiErrorNotification';
import { ToastContainer } from './components/ToastContainer';
import './App.css';

// Lazy loaded page components for optimal code splitting & fast initial load
const ExecutiveDashboard = lazy(() => import('./pages/ExecutiveDashboard').then(m => ({ default: m.ExecutiveDashboard })));
const SalesAnalytics = lazy(() => import('./pages/SalesAnalytics').then(m => ({ default: m.SalesAnalytics })));
const ProductAnalytics = lazy(() => import('./pages/ProductAnalytics').then(m => ({ default: m.ProductAnalytics })));
const OutletAnalytics = lazy(() => import('./pages/OutletAnalytics').then(m => ({ default: m.OutletAnalytics })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(m => ({ default: m.ReportsPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

const LoadingFallback: React.FC = () => (
  <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center min-h-[400px]">
    <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
    <p className="font-medium text-xs">Loading analytics view...</p>
  </div>
);

function AppContent() {
  const { theme } = useTheme();
  return (
    <div className={`flex h-screen overflow-hidden font-sans transition-colors ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        <TopNav />
        <main className="p-6 flex-1 overflow-y-auto">
          <GlobalFilterBar />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<ExecutiveDashboard />} />
              <Route path="/sales" element={<SalesAnalytics />} />
              <Route path="/products" element={<ProductAnalytics />} />
              <Route path="/outlets" element={<OutletAnalytics />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Routes>
          </Suspense>
        </main>
      </div>
      <ToastContainer />
      <ApiErrorNotification />
    </div>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <FilterProvider>
          <Router>
            <AppContent />
          </Router>
        </FilterProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
