import { query } from '../config/database.js';
import { GlobalFilters, ProductPerformance } from '../types/index.js';
import { buildWhereClause } from '../utils/queryBuilder.js';
import { PRODUCT_SORT_MAPPING, getSafeSortOrder } from '../constants/index.js';

export class ProductsRepository {
  async getTopProducts(
    filters: GlobalFilters,
    limit = 10,
    sortBy = 'totalRevenue',
    sortOrder = 'DESC'
  ): Promise<ProductPerformance[]> {
    const { whereSql, params } = buildWhereClause(filters, 'o');
    const limitParamIdx = params.length + 1;

    const safeSortBy = PRODUCT_SORT_MAPPING[sortBy] || '"totalRevenue"';
    const safeSortOrder = getSafeSortOrder(sortOrder);

    const sql = `
      SELECT 
        p.product_id AS "productId",
        p.product_name AS "productName",
        p.category,
        p.brand,
        ROUND(p.price::numeric, 2) AS price,
        ROUND(p.mrp::numeric, 2) AS mrp,
        ROUND(p.margin_percentage::numeric, 1) AS "marginPercentage",
        COALESCE(SUM(oi.quantity), 0) AS "totalQuantitySold",
        ROUND(COALESCE(SUM(oi.quantity * oi.unit_price), 0)::numeric, 2) AS "totalRevenue"
      FROM products p
      LEFT JOIN order_items oi ON p.product_id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.order_id
      ${whereSql}
      GROUP BY p.product_id, p.product_name, p.category, p.brand, p.price, p.mrp, p.margin_percentage
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT $${limitParamIdx}
    `;

    const res = await query(sql, [...params, limit]);
    return res.rows.map(r => ({
      ...r,
      price: parseFloat(r.price),
      mrp: parseFloat(r.mrp),
      marginPercentage: parseFloat(r.marginPercentage),
      totalQuantitySold: parseInt(r.totalQuantitySold, 10),
      totalRevenue: parseFloat(r.totalRevenue),
    }));
  }

  async getCategoryMetrics(filters: GlobalFilters) {
    const { whereSql, params } = buildWhereClause(filters, 'o');

    const sql = `
      SELECT 
        p.category,
        COUNT(DISTINCT p.product_id) AS product_count,
        ROUND(COALESCE(AVG(p.price), 0)::numeric, 2) AS avg_price,
        ROUND(COALESCE(AVG(p.margin_percentage), 0)::numeric, 1) AS avg_margin,
        ROUND(COALESCE(SUM(oi.quantity * oi.unit_price), 0)::numeric, 2) AS total_revenue
      FROM products p
      LEFT JOIN order_items oi ON p.product_id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.order_id
      ${whereSql}
      GROUP BY p.category
      ORDER BY total_revenue DESC
    `;

    const res = await query(sql, params);
    return res.rows.map(r => ({
      category: r.category,
      productCount: parseInt(r.product_count, 10),
      avgPrice: parseFloat(r.avg_price),
      avgMargin: parseFloat(r.avg_margin),
      totalRevenue: parseFloat(r.total_revenue),
    }));
  }
}
