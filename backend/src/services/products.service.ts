import { ProductsRepository } from '../repositories/products.repository.js';
import { GlobalFilters } from '../types/index.js';

export class ProductsService {
  private repo = new ProductsRepository();

  async getProductAnalytics(filters: GlobalFilters, sortBy?: string, sortOrder?: string) {
    const [topProducts, categoryMetrics] = await Promise.all([
      this.repo.getTopProducts(filters, 10, sortBy, sortOrder),
      this.repo.getCategoryMetrics(filters),
    ]);

    return {
      topProducts,
      categoryMetrics,
    };
  }
}
