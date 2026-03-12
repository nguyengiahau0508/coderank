import { inject } from '@angular/core';
import { ApiService } from '../../../core/services';

/**
 * Base API class for all API services
 * Provides common functionality and enforces consistent patterns
 */
export abstract class BaseApi {
  protected readonly apiService = inject(ApiService);
  protected abstract readonly endpoint: string;

  /**
   * Get full URL for endpoint
   */
  protected getUrl(path: string = ''): string {
    return path ? `${this.endpoint}${path}` : this.endpoint;
  }

  /**
   * Build query parameters from object
   * Handles arrays, nulls, and undefined values
   */
  protected buildParams(params?: Record<string, any>): Record<string, any> {
    if (!params) return {};

    const cleanParams: Record<string, any> = {};
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          // For arrays, join with comma or handle as multiple params
          cleanParams[key] = value;
        } else {
          cleanParams[key] = value;
        }
      }
    });

    return cleanParams;
  }
}
