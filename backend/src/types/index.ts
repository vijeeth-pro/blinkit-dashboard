export interface GlobalFilters {
  startDate?: string;
  endDate?: string;
  category?: string;
  customerSegment?: string;
  paymentMethod?: string;
  deliveryStatus?: string;
  storeId?: number;
  search?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ExecutiveKpiSummary {
  totalSales: number;
  totalOrders: number;
  totalItemsSold: number;
  avgOrderValue: number;
  avgRating: number;
  totalOutlets: number;
  totalProducts: number;
  totalCustomers: number;
  salesGrowthPct: number;
}

export interface SalesTrendPoint {
  date: string;
  sales: number;
  orders: number;
}

export interface CategorySales {
  category: string;
  totalSales: number;
  itemsSold: number;
}

export interface PaymentMethodSales {
  method: string;
  totalSales: number;
  orderCount: number;
}

export interface OutletPerformance {
  storeId: number;
  totalSales: number;
  totalOrders: number;
  avgOrderValue: number;
  avgDeliveryMinutes: number;
  delayedOrdersPct: number;
}

export interface ProductPerformance {
  productId: number;
  productName: string;
  category: string;
  brand: string;
  price: number;
  mrp: number;
  marginPercentage: number;
  totalQuantitySold: number;
  totalRevenue: number;
}
