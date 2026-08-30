export interface GlobalFiltersState {
  startDate: string;
  endDate: string;
  category: string;
  customerSegment: string;
  paymentMethod: string;
  deliveryStatus: string;
  storeId: string;
  search: string;
}

export interface ExecutiveSummaryData {
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

export interface SalesTrendItem {
  date: string;
  sales: number;
  orders: number;
}

export interface CategorySalesItem {
  category: string;
  totalSales: number;
  itemsSold: number;
}

export interface PaymentSalesItem {
  method: string;
  totalSales: number;
  orderCount: number;
  avgOrderValue?: number;
}

export interface DashboardResponse {
  summary: ExecutiveSummaryData;
  salesTrend: SalesTrendItem[];
  categorySales: CategorySalesItem[];
  paymentSales: PaymentSalesItem[];
}

export interface MonthlySalesItem {
  month: string;
  totalSales: number;
  orderCount: number;
  avgOrderValue: number;
}

export interface DeliveryPerformanceItem {
  deliveryStatus: string;
  count: number;
  avgTimeMinutes: number;
  avgDistanceKm: number;
}

export interface SalesAnalyticsResponse {
  monthlySales: MonthlySalesItem[];
  deliveryPerformance: DeliveryPerformanceItem[];
}

export interface ProductPerformanceItem {
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

export interface CategoryMetricItem {
  category: string;
  productCount: number;
  avgPrice: number;
  avgMargin: number;
  totalRevenue: number;
}

export interface ProductAnalyticsResponse {
  topProducts: ProductPerformanceItem[];
  categoryMetrics: CategoryMetricItem[];
}

export interface OutletPerformanceItem {
  storeId: number;
  totalSales: number;
  totalOrders: number;
  avgOrderValue: number;
  avgDeliveryMinutes: number;
  delayedOrdersPct: number;
}

export interface OutletAnalyticsResponse {
  outlets: OutletPerformanceItem[];
}

export interface SalesReportRow {
  orderId: string;
  customerName: string;
  customerSegment: string;
  area: string;
  orderDate: string;
  orderTotal: string;
  paymentMethod: string;
  deliveryStatus: string;
  storeId: number;
  deliveryTimeMinutes: string;
  rating: number;
  sentiment: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
