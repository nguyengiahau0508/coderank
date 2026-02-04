import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Business error codes for application-specific errors
 */
export enum BusinessErrorCode {
  // Auth errors (1xxx)
  INVALID_CREDENTIALS = 'AUTH_1001',
  TOKEN_EXPIRED = 'AUTH_1002',
  TOKEN_INVALID = 'AUTH_1003',
  UNAUTHORIZED_ACCESS = 'AUTH_1004',
  SESSION_EXPIRED = 'AUTH_1005',
  ACCOUNT_DISABLED = 'AUTH_1006',
  EMAIL_NOT_VERIFIED = 'AUTH_1007',

  // User errors (2xxx)
  USER_NOT_FOUND = 'USER_2001',
  USER_ALREADY_EXISTS = 'USER_2002',
  EMAIL_ALREADY_EXISTS = 'USER_2003',
  USERNAME_ALREADY_EXISTS = 'USER_2004',
  INVALID_USER_STATUS = 'USER_2005',

  // Problem errors (3xxx)
  PROBLEM_NOT_FOUND = 'PROBLEM_3001',
  PROBLEM_ALREADY_EXISTS = 'PROBLEM_3002',
  INVALID_PROBLEM_STATUS = 'PROBLEM_3003',

  // Submission errors (4xxx)
  SUBMISSION_NOT_FOUND = 'SUBMISSION_4001',
  SUBMISSION_LIMIT_EXCEEDED = 'SUBMISSION_4002',
  INVALID_SUBMISSION = 'SUBMISSION_4003',

  // Contest errors (5xxx)
  CONTEST_NOT_FOUND = 'CONTEST_5001',
  CONTEST_NOT_STARTED = 'CONTEST_5002',
  CONTEST_ENDED = 'CONTEST_5003',
  ALREADY_REGISTERED = 'CONTEST_5004',
  NOT_REGISTERED = 'CONTEST_5005',

  // Code Runner errors (6xxx)
  COMPILATION_ERROR = 'RUNNER_6001',
  RUNTIME_ERROR = 'RUNNER_6002',
  TIME_LIMIT_EXCEEDED = 'RUNNER_6003',
  MEMORY_LIMIT_EXCEEDED = 'RUNNER_6004',
  UNSUPPORTED_LANGUAGE = 'RUNNER_6005',

  // General errors (9xxx)
  RESOURCE_NOT_FOUND = 'GENERAL_9001',
  RESOURCE_CONFLICT = 'GENERAL_9002',
  VALIDATION_ERROR = 'GENERAL_9003',
  OPERATION_NOT_ALLOWED = 'GENERAL_9004',
  RATE_LIMIT_EXCEEDED = 'GENERAL_9005',
}

/**
 * Business Exception for domain-specific errors
 * Provides structured error information with error codes
 */
export class BusinessException extends HttpException {
  public readonly errorCode: BusinessErrorCode;
  public readonly details?: Record<string, any>;

  constructor(
    errorCode: BusinessErrorCode,
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    details?: Record<string, any>,
  ) {
    super(
      {
        statusCode,
        errorCode,
        message,
        details,
      },
      statusCode,
    );
    this.errorCode = errorCode;
    this.details = details;
  }
}

// ============ Convenience exception classes ============

/**
 * Not Found Exception with business error code
 */
export class ResourceNotFoundException extends BusinessException {
  constructor(
    resource: string,
    identifier?: string | number,
    errorCode: BusinessErrorCode = BusinessErrorCode.RESOURCE_NOT_FOUND,
  ) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(errorCode, message, HttpStatus.NOT_FOUND);
  }
}

/**
 * Conflict Exception with business error code
 */
export class ResourceConflictException extends BusinessException {
  constructor(
    resource: string,
    reason?: string,
    errorCode: BusinessErrorCode = BusinessErrorCode.RESOURCE_CONFLICT,
  ) {
    const message = reason
      ? `${resource} conflict: ${reason}`
      : `${resource} already exists`;
    super(errorCode, message, HttpStatus.CONFLICT);
  }
}

/**
 * Unauthorized Exception with business error code
 */
export class UnauthorizedException extends BusinessException {
  constructor(
    message: string = 'Unauthorized access',
    errorCode: BusinessErrorCode = BusinessErrorCode.UNAUTHORIZED_ACCESS,
  ) {
    super(errorCode, message, HttpStatus.UNAUTHORIZED);
  }
}

/**
 * Forbidden Exception with business error code
 */
export class ForbiddenException extends BusinessException {
  constructor(
    message: string = 'Operation not allowed',
    errorCode: BusinessErrorCode = BusinessErrorCode.OPERATION_NOT_ALLOWED,
  ) {
    super(errorCode, message, HttpStatus.FORBIDDEN);
  }
}

/**
 * Validation Exception with business error code
 */
export class ValidationException extends BusinessException {
  constructor(
    message: string,
    details?: Record<string, any>,
    errorCode: BusinessErrorCode = BusinessErrorCode.VALIDATION_ERROR,
  ) {
    super(errorCode, message, HttpStatus.BAD_REQUEST, details);
  }
}

/**
 * Rate Limit Exception
 */
export class RateLimitException extends BusinessException {
  constructor(
    message: string = 'Too many requests, please try again later',
    retryAfter?: number,
  ) {
    super(
      BusinessErrorCode.RATE_LIMIT_EXCEEDED,
      message,
      HttpStatus.TOO_MANY_REQUESTS,
      retryAfter ? { retryAfter } : undefined,
    );
  }
}
