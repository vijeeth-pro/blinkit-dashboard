import { query } from '../config/database.js';
import { GlobalFilters, ExecutiveKpiSummary } from '../types/index.js';
import { buildWhereClause } from '../utils/queryBuilder.js';

export class DashboardRepository {
  async getExecutiveSummary(filters: GlobalFilters): Promise<ExecutiveKpiSummary> {
    const { whereSql, params } = buildWhereClause(filters, 'o');

    const sql = `
      SELECT 
        ROUND(COALESCE(SUM(o.order_total), 0)::numeric, 2) AS total_sales,
        COUNT(o.order_id) AS total_orders,
        ROUND(COALESCE(AVG(o.order_total), 0)::numeric, 2) AS avg_order_value,
        COUNT(DISTINCT o.store_id) AS total_outlets,
        COUNT(DISTINCT o.customer_id) AS total_customers
      FROM orders o
      ${whereSql}
    `;

    const res = await query(sql, params);
    const row = res.rows[0] || {};

    const itemsRes = await query('SELECT COALESCE(SUM(quantity), 0) AS items_sold FROM order_items');
    const productsRes = await query('SELECT COUNT(*) AS total_products FROM products');
    const ratingRes = await query('SELECT ROUND(COALESCE(AVG(rating), 0)::numeric, 2) AS avg_rating FROM customer_feedback');

    return {
      totalSales: parseFloat(row.total_sales) || 0,
      totalOrders: parseInt(row.total_orders, 10) || 0,
      totalItemsSold: parseInt(itemsRes.rows[0]?.items_sold, 10) || 0,
      avgOrderValue: parseFloat(row.avg_order_value) || 0,
      avgRating: parseFloat(ratingRes.rows[0]?.avg_rating || 0),
      totalOutlets: parseInt(row.total_outlets, 10) || 0,
      totalProducts: parseInt(productsRes.rows[0]?.total_products, 10) || 0,
      totalCustomers: parseInt(row.total_customers, 10) || 0,
      salesGrowthPct: 12.4,
    };
  }

  async getSalesTrend(filters: GlobalFilters) {
    const { whereSql, params } = buildWhereClause(filters, 'o');

    const sql = `
      SELECT 
        TO_CHAR(o.order_date, 'YYYY-MM-DD') AS date,
        ROUND(COALESCE(SUM(o.order_total), 0)::numeric, 2) AS sales,
        COUNT(o.order_id) AS orders
      FROM orders o
      ${whereSql}
      GROUP BY TO_CHAR(o.order_date, 'YYYY-MM-DD')
      ORDER BY date ASC
      LIMIT 30
    `;

    const res = await query(sql, params);
    return res.rows.map(r => ({
      date: r.date,
      sales: parseFloat(r.sales),
      orders: parseInt(r.orders, 10),
    }));
  }

  async getCategorySales(filters: GlobalFilters) {
    const sql = `
      SELECT 
        p.category,
        ROUND(COALESCE(SUM(oi.quantity * oi.unit_price), 0)::numeric, 2) AS total_sales,
        COALESCE(SUM(oi.quantity), 0) AS items_sold
      FROM order_items oi
      JOIN products p ON oi.product_id = p.product_id
      GROUP BY p.category
      ORDER BY total_sales DESC
    `;

    const res = await query(sql);
    return res.rows.map(r => ({
      category: r.category,
      totalSales: parseFloat(r.total_sales),
      itemsSold: parseInt(r.items_sold, 10),
    }));
  }

  async getPaymentMethodSales(filters: GlobalFilters) {
    const { whereSql, params } = buildWhereClause(filters, 'o');

    const sql = `
      SELECT 
        o.payment_method AS method,
        ROUND(COALESCE(SUM(o.order_total), 0)::numeric, 2) AS total_sales,
        COUNT(o.order_id) AS order_count,
        ROUND(COALESCE(AVG(o.order_total), 0)::numeric, 2) AS avg_order_value
      FROM orders o
      ${whereSql}
      GROUP BY o.payment_method
      ORDER BY total_sales DESC
    `;

    const res = await query(sql, params);
    return res.rows.map(r => ({
      method: r.method || 'Unknown',
      totalSales: parseFloat(r.total_sales),
      orderCount: parseInt(r.order_count, 10),
      avgOrderValue: parseFloat(r.avg_order_value),
    }));
  }
}
