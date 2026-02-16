/**
 * Paginated API Response
 * Matches backend PaginatedResponse format from TransformInterceptor
 */
export interface PaginatedResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
  };
  timestamp: string;
  path: string;
}
