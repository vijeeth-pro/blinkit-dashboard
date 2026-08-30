import { ReportsRepository } from '../repositories/reports.repository.js';
import { GlobalFilters, PaginationParams } from '../types/index.js';

export class ReportsService {
  private repo = new ReportsRepository();

  async getSalesReport(filters: GlobalFilters, pagination: PaginationParams) {
    return this.repo.getSalesReport(filters, pagination);
  }

  async getExportCsv(filters: GlobalFilters): Promise<string> {
    const rows = await this.repo.getExportData(filters);
    if (rows.length === 0) return 'No data available';

    const headers = Object.keys(rows[0]).join(',');
    const csvLines = rows.map(r =>
      Object.values(r)
        .map(v => `"${String(v ?? '').replace(/"/g, '""')}"`)
        .join(',')
    );

    return [headers, ...csvLines].join('\n');
  }
}
