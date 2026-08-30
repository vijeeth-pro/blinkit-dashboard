import { PaginatedResult } from '../types/index.js';

export function formatPagination<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}
