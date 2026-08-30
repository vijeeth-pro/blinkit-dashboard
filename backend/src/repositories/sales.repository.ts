import { query } from '../config/database.js';
import { GlobalFilters } from '../types/index.js';
import { buildWhereClause } from '../utils/queryBuilder.js';

export class SalesRepository {
  async getSalesAnalytics(filters: GlobalFilters) {
    const { whereSql, params } = buildWhereClause(filters, 'o');

    const monthlySql = `
      SELECT 
        TO_CHAR(o.order_date, 'YYYY-MM') AS month,
        COALESCE(SUM(o.order_total), 0) AS total_sales,
        COUNT(o.order_id) AS order_count,
        COALESCE(AVG(o.order_total), 0) AS avg_order_value
      FROM orders o
      ${whereSql}
      GROUP BY TO_CHAR(o.order_date, 'YYYY-MM')
      ORDER BY month ASC
    `;

    const deliverySql = `
      SELECT 
        dp.delivery_status,
        COUNT(dp.order_id) AS count,
        COALESCE(AVG(dp.delivery_time_minutes), 0) AS avg_time_minutes,
        COALESCE(AVG(dp.distance_km), 0) AS avg_distance_km
      FROM delivery_performance dp
      GROUP BY dp.delivery_status
    `;

    const monthlyRes = await query(monthlySql, params);
    const deliveryRes = await query(deliverySql);

    return {
      monthlySales: monthlyRes.rows.map(r => ({
        month: r.month,
        totalSales: parseFloat(r.total_sales),
        orderCount: parseInt(r.order_count, 10),
        avgOrderValue: parseFloat(r.avg_order_value),
      })),
      deliveryPerformance: deliveryRes.rows.map(r => ({
        deliveryStatus: r.delivery_status,
        count: parseInt(r.count, 10),
        avgTimeMinutes: parseFloat(parseFloat(r.avg_time_minutes).toFixed(1)),
        avgDistanceKm: parseFloat(parseFloat(r.avg_distance_km).toFixed(2)),
      })),
    };
  }
}
