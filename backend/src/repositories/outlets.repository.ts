import { query } from '../config/database.js';
import { GlobalFilters, OutletPerformance } from '../types/index.js';
import { buildWhereClause } from '../utils/queryBuilder.js';
import { OUTLET_SORT_MAPPING, getSafeSortOrder } from '../constants/index.js';

export class OutletsRepository {
  async getOutletPerformance(
    filters: GlobalFilters,
    limit = 15,
    sortBy = 'totalSales',
    sortOrder = 'DESC'
  ): Promise<OutletPerformance[]> {
    const { whereSql, params } = buildWhereClause(filters, 'o');
    const storeCondition = whereSql ? `${whereSql} AND o.store_id IS NOT NULL` : 'WHERE o.store_id IS NOT NULL';
    const limitParamIdx = params.length + 1;

    const safeSortBy = OUTLET_SORT_MAPPING[sortBy] || '"totalSales"';
    const safeSortOrder = getSafeSortOrder(sortOrder);

    const sql = `
      SELECT 
        o.store_id AS "storeId",
        ROUND(COALESCE(SUM(o.order_total), 0)::numeric, 2) AS "totalSales",
        COUNT(o.order_id) AS "totalOrders",
        ROUND(COALESCE(AVG(o.order_total), 0)::numeric, 2) AS "avgOrderValue",
        ROUND(COALESCE(AVG(dp.delivery_time_minutes), 0)::numeric, 1) AS "avgDeliveryMinutes",
        ROUND(COALESCE((COUNT(CASE WHEN dp.delivery_status = 'Delayed' THEN 1 END) * 100.0) / NULLIF(COUNT(dp.order_id), 0), 0)::numeric, 1) AS "delayedOrdersPct"
      FROM orders o
      LEFT JOIN delivery_performance dp ON o.order_id = dp.order_id
      ${storeCondition}
      GROUP BY o.store_id
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT $${limitParamIdx}
    `;

    const res = await query(sql, [...params, limit]);
    return res.rows.map(r => ({
      storeId: parseInt(r.storeId, 10),
      totalSales: parseFloat(r.totalSales),
      totalOrders: parseInt(r.totalOrders, 10),
      avgOrderValue: parseFloat(r.avgOrderValue),
      avgDeliveryMinutes: parseFloat(r.avgDeliveryMinutes),
      delayedOrdersPct: parseFloat(r.delayedOrdersPct),
    }));
  }
}
