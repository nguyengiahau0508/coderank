import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';
import { Reflector } from '@nestjs/core';
import { RESPONSE_MESSAGE_KEY, SKIP_TRANSFORM_KEY } from '../decorators';

/**
 * Standard API Response interface
 */
export interface IApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: Record<string, any>;
  timestamp: string;
  path: string;
}

/**
 * Global Response Interceptor
 * Transforms all successful responses into a consistent format
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  IApiResponse<T>
> {
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IApiResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Check if transformation should be skipped
    const skipTransform = this.reflector.getAllAndOverride<boolean>(
      SKIP_TRANSFORM_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipTransform) {
      return next.handle();
    }

    // Get custom message from decorator or use default
    const customMessage = this.reflector.getAllAndOverride<string>(
      RESPONSE_MESSAGE_KEY,
      [context.getHandler(), context.getClass()],
    );

    return next.handle().pipe(
      map((data) => {
        const statusCode = response.statusCode || HttpStatus.OK;

        // Handle null/undefined data
        if (data === null || data === undefined) {
          return {
            success: true,
            statusCode,
            message: customMessage || this.getDefaultMessage(statusCode),
            timestamp: new Date().toISOString(),
            path: request.url,
          };
        }

        // Handle paginated responses (check if data has pagination structure)
        if (this.isPaginatedResponse(data)) {
          return {
            success: true,
            statusCode,
            message: customMessage || this.getDefaultMessage(statusCode),
            data: data.items || data.data,
            meta: {
              page: data.page,
              limit: data.limit,
              totalItems: data.totalItems || data.total,
              totalPages: data.totalPages,
              hasPrevious: data.hasPrevious ?? data.page > 1,
              hasNext: data.hasNext ?? data.page < data.totalPages,
            },
            timestamp: new Date().toISOString(),
            path: request.url,
          };
        }

        // Handle responses that already have our format
        if (this.isAlreadyFormatted(data)) {
          return {
            ...data,
            timestamp: data.timestamp || new Date().toISOString(),
            path: data.path || request.url,
          };
        }

        // Standard response transformation
        return {
          success: true,
          statusCode,
          message: customMessage || this.getDefaultMessage(statusCode),
          data,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }),
    );
  }

  /**
   * Check if response is paginated
   */
  private isPaginatedResponse(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      ('items' in data || 'data' in data) &&
      ('totalItems' in data || 'total' in data) &&
      'page' in data
    );
  }

  /**
   * Check if response is already in our standard format
   */
  private isAlreadyFormatted(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      'success' in data &&
      'statusCode' in data &&
      'message' in data
    );
  }

  /**
   * Get default message based on status code
   */
  private getDefaultMessage(statusCode: number): string {
    const messages: Record<number, string> = {
      [HttpStatus.OK]: 'Success',
      [HttpStatus.CREATED]: 'Resource created successfully',
      [HttpStatus.ACCEPTED]: 'Request accepted',
      [HttpStatus.NO_CONTENT]: 'No content',
    };

    return messages[statusCode] || 'Success';
  }
}
