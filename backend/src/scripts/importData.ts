import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';
import { pool } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATASET_DIR = path.join(__dirname, '../../../dataset');

function parseDate(val: string | null): string | null {
  if (!val || val.trim() === '' || val.toUpperCase() === 'NULL') return null;
  val = val.trim();
  if (val.includes('-') && val.length === 10 && val.indexOf('-') === 2) {
    // DD-MM-YYYY format
    const [d, m, y] = val.split('-');
    return `${y}-${m}-${d}`;
  }
  return val;
}

function parseNum(val: string | null): number | null {
  if (!val || val.trim() === '' || val.toUpperCase() === 'NULL') return null;
  const parsed = parseFloat(val.trim());
  return isNaN(parsed) ? null : parsed;
}

function parseIntNum(val: string | null): number | null {
  if (!val || val.trim() === '' || val.toUpperCase() === 'NULL') return null;
  const parsed = parseInt(val.trim(), 10);
  return isNaN(parsed) ? null : parsed;
}

async function readCsv(filename: string): Promise<any[]> {
  const filePath = path.join(DATASET_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`File missing: ${filename}`);
    return [];
  }
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

async function runImport() {
  console.log('🚀 Starting Blinkit Data Ingestion Pipeline...');
  const startTime = Date.now();

  const client = await pool.connect();

  try {
    // 1. Initialize Schema
    console.log('📄 Executing database schema creation (schema.sql)...');
    const schemaPath = path.join(__dirname, '../db/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    await client.query(schemaSql);
    console.log('✅ Schema and indexes successfully initialized!');

    // 2. Import Products
    const productsData = await readCsv('blinkit_products.csv');
    console.log(`📦 Importing ${productsData.length} Products...`);
    await client.query('BEGIN');
    for (const row of productsData) {
      await client.query(
        `INSERT INTO products (product_id, product_name, category, brand, price, mrp, margin_percentage, shelf_life_days, min_stock_level, max_stock_level)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (product_id) DO NOTHING`,
        [
          parseIntNum(row.product_id),
          row.product_name || 'Unknown',
          row.category || 'General',
          row.brand || 'Generic',
          parseNum(row.price) || 0,
          parseNum(row.mrp) || 0,
          parseNum(row.margin_percentage) || 0,
          parseIntNum(row.shelf_life_days) || 0,
          parseIntNum(row.min_stock_level) || 0,
          parseIntNum(row.max_stock_level) || 0,
        ]
      );
    }
    await client.query('COMMIT');
    console.log(`✅ Products imported!`);

    // 3. Import Customers
    const customersData = await readCsv('blinkit_customers.csv');
    console.log(`👥 Importing ${customersData.length} Customers...`);
    await client.query('BEGIN');
    for (const row of customersData) {
      await client.query(
        `INSERT INTO customers (customer_id, customer_name, email, phone, address, area, pincode, registration_date, customer_segment, total_orders, avg_order_value)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (customer_id) DO NOTHING`,
        [
          parseIntNum(row.customer_id),
          row.customer_name || 'Customer',
          row.email || null,
          row.phone || null,
          row.address || null,
          row.area || 'Unknown',
          row.pincode || null,
          parseDate(row.registration_date),
          row.customer_segment || 'Standard',
          parseIntNum(row.total_orders) || 0,
          parseNum(row.avg_order_value) || 0,
        ]
      );
    }
    await client.query('COMMIT');
    console.log(`✅ Customers imported!`);

    // 4. Import Orders
    const ordersData = await readCsv('blinkit_orders.csv');
    console.log(`🛒 Importing ${ordersData.length} Orders...`);
    await client.query('BEGIN');
    for (const row of ordersData) {
      await client.query(
        `INSERT INTO orders (order_id, customer_id, order_date, promised_delivery_time, actual_delivery_time, delivery_status, order_total, payment_method, delivery_partner_id, store_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (order_id) DO NOTHING`,
        [
          parseIntNum(row.order_id),
          parseIntNum(row.customer_id),
          parseDate(row.order_date),
          parseDate(row.promised_delivery_time),
          parseDate(row.actual_delivery_time),
          row.delivery_status || 'On Time',
          parseNum(row.order_total) || 0,
          row.payment_method || 'Cash',
          parseIntNum(row.delivery_partner_id),
          parseIntNum(row.store_id),
        ]
      );
    }
    await client.query('COMMIT');
    console.log(`✅ Orders imported!`);

    // 5. Import Order Items
    const orderItemsData = await readCsv('blinkit_order_items.csv');
    console.log(`🛍️ Importing ${orderItemsData.length} Order Items...`);
    await client.query('BEGIN');
    for (const row of orderItemsData) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [
          parseIntNum(row.order_id),
          parseIntNum(row.product_id),
          parseIntNum(row.quantity) || 1,
          parseNum(row.unit_price) || 0,
        ]
      );
    }
    await client.query('COMMIT');
    console.log(`✅ Order Items imported!`);

    // 6. Import Delivery Performance
    const deliveryData = await readCsv('blinkit_delivery_performance.csv');
    console.log(`🚚 Importing ${deliveryData.length} Delivery Performance Records...`);
    await client.query('BEGIN');
    for (const row of deliveryData) {
      await client.query(
        `INSERT INTO delivery_performance (order_id, delivery_partner_id, promised_time, actual_time, delivery_time_minutes, distance_km, delivery_status, reasons_if_delayed)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (order_id) DO NOTHING`,
        [
          parseIntNum(row.order_id),
          parseIntNum(row.delivery_partner_id),
          parseDate(row.promised_time),
          parseDate(row.actual_time),
          parseNum(row.delivery_time_minutes),
          parseNum(row.distance_km),
          row.delivery_status || 'On Time',
          row.reasons_if_delayed || null,
        ]
      );
    }
    await client.query('COMMIT');
    console.log(`✅ Delivery Performance imported!`);

    // 7. Import Customer Feedback
    const feedbackData = await readCsv('blinkit_customer_feedback.csv');
    console.log(`💬 Importing ${feedbackData.length} Customer Feedback Records...`);
    await client.query('BEGIN');
    for (const row of feedbackData) {
      await client.query(
        `INSERT INTO customer_feedback (feedback_id, order_id, customer_id, rating, feedback_text, feedback_category, sentiment, feedback_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (feedback_id) DO NOTHING`,
        [
          parseIntNum(row.feedback_id),
          parseIntNum(row.order_id),
          parseIntNum(row.customer_id),
          parseIntNum(row.rating),
          row.feedback_text || null,
          row.feedback_category || 'General',
          row.sentiment || 'Neutral',
          parseDate(row.feedback_date),
        ]
      );
    }
    await client.query('COMMIT');
    console.log(`✅ Customer Feedback imported!`);

    // 8. Import Marketing Performance
    const marketingData = await readCsv('blinkit_marketing_performance.csv');
    console.log(`📢 Importing ${marketingData.length} Marketing Records...`);
    await client.query('BEGIN');
    for (const row of marketingData) {
      await client.query(
        `INSERT INTO marketing_performance (campaign_id, campaign_name, date, target_audience, channel, impressions, clicks, conversions, spend, revenue_generated, roas)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (campaign_id) DO NOTHING`,
        [
          parseIntNum(row.campaign_id),
          row.campaign_name || 'Campaign',
          parseDate(row.date),
          row.target_audience || 'All',
          row.channel || 'App',
          parseIntNum(row.impressions) || 0,
          parseIntNum(row.clicks) || 0,
          parseIntNum(row.conversions) || 0,
          parseNum(row.spend) || 0,
          parseNum(row.revenue_generated) || 0,
          parseNum(row.roas) || 0,
        ]
      );
    }
    await client.query('COMMIT');
    console.log(`✅ Marketing Performance imported!`);

    // 9. Import Inventory
    const inventoryData = await readCsv('blinkit_inventory.csv');
    console.log(`📊 Importing ${inventoryData.length} Inventory Records...`);
    // Batch in chunks of 5000
    const BATCH_SIZE = 5000;
    for (let i = 0; i < inventoryData.length; i += BATCH_SIZE) {
      const chunk = inventoryData.slice(i, i + BATCH_SIZE);
      await client.query('BEGIN');
      for (const row of chunk) {
        await client.query(
          `INSERT INTO inventory (product_id, date, stock_received, damaged_stock)
           VALUES ($1, $2, $3, $4)`,
          [
            parseIntNum(row.product_id),
            parseDate(row.date) || '2023-01-01',
            parseIntNum(row.stock_received) || 0,
            parseIntNum(row.damaged_stock) || 0,
          ]
        );
      }
      await client.query('COMMIT');
    }
    console.log(`✅ Inventory imported!`);

    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n🎉 Ingestion completed successfully in ${elapsedSec}s!`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error during data ingestion:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runImport();
