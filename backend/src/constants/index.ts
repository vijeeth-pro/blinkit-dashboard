export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;
export const DEFAULT_PAGE = 1;

export const DEFAULT_SORT_ORDER = 'DESC';
export const ALLOWED_SORT_ORDERS = new Set(['ASC', 'DESC']);

export const PRODUCT_SORT_MAPPING: Record<string, string> = {
  productId: 'p.product_id',
  productName: 'p.product_name',
  category: 'p.category',
  brand: 'p.brand',
  price: 'p.price',
  mrp: 'p.mrp',
  marginPercentage: 'p.margin_percentage',
  totalQuantitySold: '"totalQuantitySold"',
  totalRevenue: '"totalRevenue"',
};

export const OUTLET_SORT_MAPPING: Record<string, string> = {
  storeId: 'o.store_id',
  totalSales: '"totalSales"',
  totalOrders: '"totalOrders"',
  avgOrderValue: '"avgOrderValue"',
  avgDeliveryMinutes: '"avgDeliveryMinutes"',
  delayedOrdersPct: '"delayedOrdersPct"',
};

export const REPORT_SORT_MAPPING: Record<string, string> = {
  order_id: 'o.order_id',
  customer_name: 'c.customer_name',
  customer_segment: 'c.customer_segment',
  area: 'c.area',
  order_date: 'o.order_date',
  order_total: 'o.order_total',
  payment_method: 'o.payment_method',
  delivery_status: 'o.delivery_status',
  store_id: 'o.store_id',
};

export const getSafeSortOrder = (sortOrder?: string): 'ASC' | 'DESC' => {
  const upper = (sortOrder || '').toUpperCase();
  return ALLOWED_SORT_ORDERS.has(upper) ? (upper as 'ASC' | 'DESC') : 'DESC';
};
