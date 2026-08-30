import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import {
  GlobalFiltersState,
  DashboardResponse,
  SalesAnalyticsResponse,
  ProductAnalyticsResponse,
  OutletAnalyticsResponse,
  PaginatedResponse,
  SalesReportRow,
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

type ToastListener = (toast: ToastMessage) => void;
const toastListeners: Set<ToastListener> = new Set();

export const subscribeToastEvents = (listener: ToastListener) => {
  toastListeners.add(listener);
  return () => toastListeners.delete(listener);
};

export const notifyToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
  const toast: ToastMessage = {
    id: Math.random().toString(36).substring(2, 9),
    type,
    title,
    message,
  };
  toastListeners.forEach(listener => listener(toast));
};

// Create central Axios instance
export const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Extend Axios config type to support optional showSuccessToast flag
declare module 'axios' {
  export interface AxiosRequestConfig {
    showSuccessToast?: boolean;
  }
}

// ----------------------------------------------------
// 1. AXIOS REQUEST INTERCEPTOR
// ----------------------------------------------------
client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error: AxiosError) => {
    console.error('[API Request Error]', error);
    notifyToast('error', 'Request Failed', 'Failed to initiate network request.');
    return Promise.reject(error);
  }
);

// ----------------------------------------------------
// 2. AXIOS RESPONSE INTERCEPTOR
// ----------------------------------------------------
client.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`);

    if ((response.config as any).showSuccessToast) {
      const cleanUrl = response.config.url?.split('?')[0] || '';
      const endpointName = cleanUrl.replace('/', '').replace('/', ' ').toUpperCase() || 'Operation';
      notifyToast('success', 'Action Completed', `Successfully executed ${endpointName}.`);
    }

    return response;
  },
  (error: AxiosError<{ message?: string; errorCode?: string }>) => {
    let errorMessage = 'An unexpected API error occurred.';
    let isNetworkError = false;

    if (error.response) {
      const status = error.response.status;
      const backendMessage = error.response.data?.message;

      if (status === 404) {
        errorMessage = 'Requested API endpoint was not found (404).';
      } else if (status === 400) {
        errorMessage = backendMessage || 'Invalid query parameters submitted (400).';
      } else if (status >= 500) {
        errorMessage = backendMessage || `Backend database error (${status}). Please try again.`;
      } else {
        errorMessage = backendMessage || `API Response Error (${status}).`;
      }
      notifyToast('error', `API Error (${status})`, errorMessage);
    } else if (error.request) {
      isNetworkError = true;
      errorMessage = 'Cannot connect to Express backend on http://localhost:5001. Please ensure the backend server is running.';
      notifyToast('error', 'Backend Offline', errorMessage);
    } else {
      errorMessage = error.message || 'Failed to trigger API request.';
      notifyToast('info', 'System Notice', errorMessage);
    }

    console.error(`[API Interceptor Handled Error]`, { errorMessage, isNetworkError, rawError: error });
    return Promise.reject(new Error(errorMessage));
  }
);

// Helper to filter empty or default parameters
function cleanFilters(filters: Partial<GlobalFiltersState>) {
  const params: Record<string, string> = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== 'All' && value.trim() !== '') {
      params[key] = value;
    }
  });
  return params;
}

// ----------------------------------------------------
// API METHODS
// ----------------------------------------------------
export async function fetchDashboardSummary(filters: Partial<GlobalFiltersState>): Promise<DashboardResponse> {
  const res = await client.get('/dashboard/summary', { params: cleanFilters(filters) });
  return res.data.data;
}

export async function fetchSalesAnalytics(filters: Partial<GlobalFiltersState>): Promise<SalesAnalyticsResponse> {
  const res = await client.get('/sales/analytics', { params: cleanFilters(filters) });
  return res.data.data;
}

export async function fetchProductAnalytics(
  filters: Partial<GlobalFiltersState> = {},
  sortBy = 'totalRevenue',
  sortOrder = 'DESC'
): Promise<ProductAnalyticsResponse> {
  const params = {
    ...cleanFilters(filters),
    sortBy,
    sortOrder,
  };
  const res = await client.get('/products/analytics', { params });
  return res.data.data;
}

export async function fetchOutletAnalytics(
  filters: Partial<GlobalFiltersState> = {},
  sortBy = 'totalSales',
  sortOrder = 'DESC'
): Promise<OutletAnalyticsResponse> {
  const params = {
    ...cleanFilters(filters),
    sortBy,
    sortOrder,
  };
  const res = await client.get('/outlets/analytics', { params });
  return res.data.data;
}

export async function fetchSalesReport(
  filters: Partial<GlobalFiltersState>,
  page = 1,
  limit = 20,
  sortBy = 'order_date',
  sortOrder = 'DESC'
): Promise<PaginatedResponse<SalesReportRow>> {
  const params = {
    ...cleanFilters(filters),
    page: String(page),
    limit: String(limit),
    sortBy,
    sortOrder,
  };
  const res = await client.get('/reports/sales', { params });
  return res.data;
}

export function getExportCsvUrl(filters: Partial<GlobalFiltersState>): string {
  const queryStr = new URLSearchParams(cleanFilters(filters)).toString();
  return `${API_BASE_URL}/reports/export${queryStr ? `?${queryStr}` : ''}`;
}
