// ** Types
import type { PaginationMeta } from '@/types/common'

/**
 * Calculates pagination metadata
 */
export function calculatePagination(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  }
}


/**
 * Formats response with timestamp
 */
export function formatResponse<T>(data: T): T & { timestamp: string } {
  return {
    ...data,
    timestamp: new Date().toISOString(),
  }
}
