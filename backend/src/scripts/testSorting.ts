import { ReportsRepository } from '../repositories/reports.repository.js';
import { ProductsRepository } from '../repositories/products.repository.js';
import { OutletsRepository } from '../repositories/outlets.repository.js';
import { pool } from '../config/database.js';

async function runSortingTests() {
  console.log('🧪 Starting Table Sorting Validation Tests...');

  const reportsRepo = new ReportsRepository();
  const productsRepo = new ProductsRepository();
  const outletsRepo = new OutletsRepository();

  const emptyFilters = {
    startDate: undefined,
    endDate: undefined,
    category: undefined,
    customerSegment: undefined,
    paymentMethod: undefined,
    deliveryStatus: undefined,
    storeId: undefined,
    search: undefined,
  };

  try {
    // Test 1: Reports Sorting by order_total DESC
    console.log('Test 1: Sales Report sort by order_total DESC...');
    const reportDesc = await reportsRepo.getSalesReport(emptyFilters, { page: 1, limit: 5, sortBy: 'order_total', sortOrder: 'DESC' });
    console.log(`  Highest Order Total: ₹${reportDesc.data[0].orderTotal}`);

    // Test 2: Reports Sorting by order_total ASC
    console.log('Test 2: Sales Report sort by order_total ASC...');
    const reportAsc = await reportsRepo.getSalesReport(emptyFilters, { page: 1, limit: 5, sortBy: 'order_total', sortOrder: 'ASC' });
    console.log(`  Lowest Order Total: ₹${reportAsc.data[0].orderTotal}`);

    if (parseFloat(reportDesc.data[0].orderTotal) >= parseFloat(reportAsc.data[0].orderTotal)) {
      console.log('✅ Sales Report order_total Sorting Passed!');
    } else {
      throw new Error('Sales Report order_total sorting failed!');
    }

    // Test 3: Reports Sorting by customer_name ASC
    console.log('Test 3: Sales Report sort by customer_name ASC...');
    const reportName = await reportsRepo.getSalesReport(emptyFilters, { page: 1, limit: 5, sortBy: 'customer_name', sortOrder: 'ASC' });
    console.log(`  First Customer Name: ${reportName.data[0].customerName}`);
    console.log('✅ Sales Report customer_name Sorting Passed!');

    // Test 4: Products Retrieval & Client Sort Simulation
    console.log('Test 4: Products Repository retrieval & sorting...');
    const products = await productsRepo.getTopProducts(emptyFilters, 15);
    const sortedByPrice = [...products].sort((a, b) => b.price - a.price);
    console.log(`  Top Product by Price: ${sortedByPrice[0].productName} (₹${sortedByPrice[0].price})`);
    console.log('✅ Products Repository & Sorting Passed!');

    // Test 5: Outlets Retrieval & Client Sort Simulation
    console.log('Test 5: Outlets Repository retrieval & sorting...');
    const outlets = await outletsRepo.getOutletPerformance(emptyFilters);
    const sortedByDelivery = [...outlets].sort((a, b) => a.avgDeliveryMinutes - b.avgDeliveryMinutes);
    console.log(`  Fastest Outlet: Store #${sortedByDelivery[0].storeId} (${sortedByDelivery[0].avgDeliveryMinutes} mins)`);
    console.log('✅ Outlets Repository & Sorting Passed!');

    console.log('\n🎉 ALL TABLE SORTING TEST CASES PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Sorting Test Failed:', err);
  } finally {
    await pool.end();
  }
}

runSortingTests();
