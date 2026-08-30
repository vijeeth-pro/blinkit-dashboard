import { GlobalFilters } from '../types/index.js';

export function buildWhereClause(
  filters: GlobalFilters,
  tableAlias = 'o',
  paramOffset = 1
): { whereSql: string; params: any[]; nextParamOffset: number } {
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIdx = paramOffset;

  if (filters.startDate) {
    conditions.push(`${tableAlias}.order_date >= $${paramIdx}`);
    params.push(filters.startDate);
    paramIdx++;
  }

  if (filters.endDate) {
    conditions.push(`${tableAlias}.order_date <= $${paramIdx}`);
    params.push(filters.endDate);
    paramIdx++;
  }

  if (filters.paymentMethod && filters.paymentMethod !== 'All') {
    conditions.push(`${tableAlias}.payment_method = $${paramIdx}`);
    params.push(filters.paymentMethod);
    paramIdx++;
  }

  if (filters.deliveryStatus && filters.deliveryStatus !== 'All') {
    conditions.push(`${tableAlias}.delivery_status = $${paramIdx}`);
    params.push(filters.deliveryStatus);
    paramIdx++;
  }

  if (filters.customerSegment && filters.customerSegment !== 'All') {
    conditions.push(`c.customer_segment = $${paramIdx}`);
    params.push(filters.customerSegment);
    paramIdx++;
  }

  if (filters.storeId) {
    conditions.push(`${tableAlias}.store_id = $${paramIdx}`);
    params.push(filters.storeId);
    paramIdx++;
  }

  if (filters.search && filters.search.trim() !== '') {
    const searchTerm = `%${filters.search.trim()}%`;
    conditions.push(`(
      c.customer_name ILIKE $${paramIdx} OR 
      c.area ILIKE $${paramIdx} OR 
      ${tableAlias}.order_id::text ILIKE $${paramIdx}
    )`);
    params.push(searchTerm);
    paramIdx++;
  }

  const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { whereSql, params, nextParamOffset: paramIdx };
}
