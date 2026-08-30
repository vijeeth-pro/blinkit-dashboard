import { SalesRepository } from '../repositories/sales.repository.js';
import { GlobalFilters } from '../types/index.js';

export class SalesService {
  private repo = new SalesRepository();

  async getSalesAnalytics(filters: GlobalFilters) {
    return this.repo.getSalesAnalytics(filters);
  }
}
