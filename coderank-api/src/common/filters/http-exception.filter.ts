import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError, EntityNotFoundError } from 'typeorm';

/**
 * Error response interface for consistent API error format
 */
export interface IErrorResponse {
  success: boolean;
  statusCode: number;
  message: string;
  error: string | string[];
  timestamp: string;
  path: string;
  method: string;
  correlationId?: string;
}

/**
 * Global HTTP Exception Filter
 * Catches all exceptions and formats them into a consistent response structure
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.buildErrorResponse(exception, request);

    // Log error details
    this.logError(exception, errorResponse, request);

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  /**
   * Build standardized error response based on exception type
   */
  private buildErrorResponse(exception: unknown, request: Request): IErrorResponse {
    const timestamp = new Date().toISOString();
    const path = request.url;
    const method = request.method;
    const correlationId = request.headers['x-correlation-id'] as string;

    // Handle HttpException (NestJS built-in exceptions)
    if (exception instanceof HttpException) {
      return this.handleHttpException(exception, timestamp, path, method, correlationId);
    }

    // Handle TypeORM QueryFailedError
    if (exception instanceof QueryFailedError) {
      return this.handleQueryFailedError(exception, timestamp, path, method, correlationId);
    }

    // Handle TypeORM EntityNotFoundError
    if (exception instanceof EntityNotFoundError) {
      return this.handleEntityNotFoundError(exception, timestamp, path, method, correlationId);
    }

    // Handle generic errors
    return this.handleUnknownError(exception, timestamp, path, method, correlationId);
  }

  /**
   * Handle NestJS HttpException
   */
  private handleHttpException(
    exception: HttpException,
    timestamp: string,
    path: string,
    method: string,
    correlationId?: string,
  ): IErrorResponse {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string;
    let error: string | string[];

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
      error = exception.name;
    } else if (typeof exceptionResponse === 'object') {
      const responseObj = exceptionResponse as Record<string, any>;
      message = responseObj.message || exception.message;
      error = responseObj.error || exception.name;

      // Handle validation errors (class-validator)
      if (Array.isArray(responseObj.message)) {
        error = responseObj.message;
        message = 'Validation failed';
      }
    } else {
      message = exception.message;
      error = exception.name;
    }

    return {
      success: false,
      statusCode: status,
      message,
      error,
      timestamp,
      path,
      method,
      ...(correlationId && { correlationId }),
    };
  }

  /**
   * Handle TypeORM QueryFailedError (database errors)
   */
  private handleQueryFailedError(
    exception: QueryFailedError,
    timestamp: string,
    path: string,
    method: string,
    correlationId?: string,
  ): IErrorResponse {
    const driverError = exception.driverError as any;

    // Handle duplicate entry error (MySQL/MariaDB error code 1062)
    if (driverError?.errno === 1062 || driverError?.code === 'ER_DUP_ENTRY') {
      return {
        success: false,
        statusCode: HttpStatus.CONFLICT,
        message: 'Resource already exists',
        error: 'Duplicate entry detected',
        timestamp,
        path,
        method,
        ...(correlationId && { correlationId }),
      };
    }

    // Handle foreign key constraint error (MySQL/MariaDB error code 1452)
    if (driverError?.errno === 1452 || driverError?.code === 'ER_NO_REFERENCED_ROW_2') {
      return {
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Referenced resource not found',
        error: 'Foreign key constraint failed',
        timestamp,
        path,
        method,
        ...(correlationId && { correlationId }),
      };
    }

    // Handle cannot delete parent row (MySQL/MariaDB error code 1451)
    if (driverError?.errno === 1451 || driverError?.code === 'ER_ROW_IS_REFERENCED_2') {
      return {
        success: false,
        statusCode: HttpStatus.CONFLICT,
        message: 'Cannot delete resource with existing references',
        error: 'Resource is referenced by other records',
        timestamp,
        path,
        method,
        ...(correlationId && { correlationId }),
      };
    }

    // Generic database error
    return {
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Database operation failed',
      error: 'Internal server error',
      timestamp,
      path,
      method,
      ...(correlationId && { correlationId }),
    };
  }

  /**
   * Handle TypeORM EntityNotFoundError
   */
  private handleEntityNotFoundError(
    exception: EntityNotFoundError,
    timestamp: string,
    path: string,
    method: string,
    correlationId?: string,
  ): IErrorResponse {
    return {
      success: false,
      statusCode: HttpStatus.NOT_FOUND,
      message: 'Resource not found',
      error: 'The requested resource does not exist',
      timestamp,
      path,
      method,
      ...(correlationId && { correlationId }),
    };
  }

  /**
   * Handle unknown errors
   */
  private handleUnknownError(
    exception: unknown,
    timestamp: string,
    path: string,
    method: string,
    correlationId?: string,
  ): IErrorResponse {
    // In production, don't expose internal error details
    const isProduction = process.env.NODE_ENV === 'production';

    let errorMessage = 'Internal server error';
    if (!isProduction && exception instanceof Error) {
      errorMessage = exception.message;
    }

    return {
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred',
      error: errorMessage,
      timestamp,
      path,
      method,
      ...(correlationId && { correlationId }),
    };
  }

  /**
   * Log error details for debugging and monitoring
   */
  private logError(
    exception: unknown,
    errorResponse: IErrorResponse,
    request: Request,
  ): void {
    const { statusCode, message, error } = errorResponse;
    const { method, url, body, query, params } = request;
    const userAgent = request.get('user-agent') || '';
    const ip = request.ip || request.socket?.remoteAddress;

    const logContext = {
      statusCode,
      message,
      error,
      method,
      url,
      body: this.sanitizeBody(body),
      query,
      params,
      userAgent,
      ip,
      correlationId: errorResponse.correlationId,
    };

    // Log based on severity
    if (statusCode >= 500) {
      this.logger.error(
        `[${method}] ${url} - ${statusCode}`,
        exception instanceof Error ? exception.stack : JSON.stringify(exception),
        JSON.stringify(logContext),
      );
    } else if (statusCode >= 400) {
      this.logger.warn(
        `[${method}] ${url} - ${statusCode}: ${message}`,
        JSON.stringify(logContext),
      );
    }
  }

  /**
   * Remove sensitive data from request body before logging
   */
  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sensitiveFields = ['password', 'token', 'accessToken', 'refreshToken', 'secret', 'apiKey'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}
