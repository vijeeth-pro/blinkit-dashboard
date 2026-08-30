import { Request, Response, NextFunction } from 'express';
import { ReportsService } from '../services/reports.service.js';

const service = new ReportsService();

export async function getSalesReport(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = '1', limit = '20', sortBy, sortOrder, ...filters } = req.query as any;
    const pagination = {
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 20,
      sortBy: sortBy as string,
      sortOrder: (sortOrder as string)?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
    };

    const result = await service.getSalesReport(filters, pagination as any);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function exportReportCsv(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = req.query as any;
    const csvContent = await service.getExportCsv(filters);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="blinkit_sales_report.csv"');
    res.status(200).send(csvContent);
  } catch (err) {
    next(err);
  }
}
