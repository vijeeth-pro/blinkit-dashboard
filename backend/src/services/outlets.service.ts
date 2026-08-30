import { OutletsRepository } from '../repositories/outlets.repository.js';
import { GlobalFilters } from '../types/index.js';

export class OutletsService {
  private repo = new OutletsRepository();

  async getOutletAnalytics(filters: GlobalFilters, sortBy?: string, sortOrder?: string) {
    const outlets = await this.repo.getOutletPerformance(filters, 15, sortBy, sortOrder);
    return { outlets };
  }
}
