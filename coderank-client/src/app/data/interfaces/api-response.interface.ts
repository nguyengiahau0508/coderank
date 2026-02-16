/**
 * Standard API Response interface
 * Matches backend IApiResponse from TransformInterceptor
 */
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: Record<string, any>;
  timestamp: string;
  path: string;
}
