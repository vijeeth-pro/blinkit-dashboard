import { DashboardRepository } from '../repositories/dashboard.repository.js';
import { GlobalFilters } from '../types/index.js';

export class DashboardService {
  private repo = new DashboardRepository();

  async getDashboardData(filters: GlobalFilters) {
    const [summary, salesTrend, categorySales, paymentSales] = await Promise.all([
      this.repo.getExecutiveSummary(filters),
      this.repo.getSalesTrend(filters),
      this.repo.getCategorySales(filters),
      this.repo.getPaymentMethodSales(filters),
    ]);

    return {
      summary,
      salesTrend,
      categorySales,
      paymentSales,
    };
  }
}
