import { query } from '../config/database.js';
import { GlobalFilters, PaginationParams } from '../types/index.js';
import { buildWhereClause } from '../utils/queryBuilder.js';
import { formatPagination } from '../utils/pagination.js';
import { REPORT_SORT_MAPPING, getSafeSortOrder } from '../constants/index.js';

export class ReportsRepository {
  async getSalesReport(filters: GlobalFilters, pagination: PaginationParams) {
    const { whereSql, params } = buildWhereClause(filters, 'o');
    const { page, limit, sortBy = 'order_date', sortOrder = 'DESC' } = pagination;
    const offset = (page - 1) * limit;

    const countSql = `
      SELECT COUNT(*) 
      FROM orders o 
      LEFT JOIN customers c ON o.customer_id = c.customer_id 
      ${whereSql}
    `;
    const countRes = await query(countSql, params);
    const total = parseInt(countRes.rows[0].count, 10);

    const safeSortBy = REPORT_SORT_MAPPING[sortBy] || 'o.order_date';
    const safeSortOrder = getSafeSortOrder(sortOrder);

    const paramIdx = params.length + 1;
    const dataSql = `
      SELECT 
        o.order_id AS "orderId",
        c.customer_name AS "customerName",
        c.customer_segment AS "customerSegment",
        c.area,
        TO_CHAR(o.order_date, 'YYYY-MM-DD HH24:MI:SS') AS "orderDate",
        o.order_total AS "orderTotal",
        o.payment_method AS "paymentMethod",
        o.delivery_status AS "deliveryStatus",
        o.store_id AS "storeId",
        dp.delivery_time_minutes AS "deliveryTimeMinutes",
        cf.rating,
        cf.sentiment
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.customer_id
      LEFT JOIN delivery_performance dp ON o.order_id = dp.order_id
      LEFT JOIN customer_feedback cf ON o.order_id = cf.order_id
      ${whereSql}
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
    `;

    const dataRes = await query(dataSql, [...params, limit, offset]);
    return formatPagination(dataRes.rows, total, page, limit);
  }

  async getExportData(filters: GlobalFilters) {
    const { whereSql, params } = buildWhereClause(filters, 'o');

    const sql = `
      SELECT 
        o.order_id AS "Order ID",
        c.customer_name AS "Customer Name",
        c.customer_segment AS "Customer Segment",
        c.area AS "Area",
        TO_CHAR(o.order_date, 'YYYY-MM-DD HH24:MI:SS') AS "Order Date",
        o.order_total AS "Order Total (INR)",
        o.payment_method AS "Payment Method",
        o.delivery_status AS "Delivery Status",
        o.store_id AS "Store ID",
        dp.delivery_time_minutes AS "Delivery Time (Mins)",
        cf.rating AS "Customer Rating",
        cf.sentiment AS "Customer Sentiment"
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.customer_id
      LEFT JOIN delivery_performance dp ON o.order_id = dp.order_id
      LEFT JOIN customer_feedback cf ON o.order_id = cf.order_id
      ${whereSql}
      ORDER BY o.order_date DESC
      LIMIT 10000
    `;

    const res = await query(sql, params);
    return res.rows;
  }
}
