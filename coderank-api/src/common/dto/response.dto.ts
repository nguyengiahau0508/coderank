import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Standard API Response wrapper
 * All API responses should follow this format
 */
export class ApiResponseDto<T> {
  @ApiProperty({
    description: 'HTTP status code',
    example: 200
  })
  statusCode: number;

  @ApiProperty({
    description: 'Response message',
    example: 'Success'
  })
  message: string;

  @ApiPropertyOptional({
    description: 'Response data (type varies by endpoint)'
  })
  data?: T;

  @ApiPropertyOptional({
    description: 'Additional metadata (pagination, etc.)'
  })
  meta?: Record<string, any>;
}

/**
 * Pagination metadata
 */
export class PaginationMetaDto {
  @ApiProperty({
    description: 'Current page number',
    example: 1
  })
  page: number;

  @ApiProperty({
    description: 'Items per page',
    example: 10
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of items',
    example: 100
  })
  totalItems: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 10
  })
  totalPages: number;

  @ApiProperty({
    description: 'Has previous page',
    example: false
  })
  hasPrevious: boolean;

  @ApiProperty({
    description: 'Has next page',
    example: true
  })
  hasNext: boolean;
}

/**
 * Paginated response wrapper
 */
export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'HTTP status code',
    example: 200
  })
  statusCode: number;

  @ApiProperty({
    description: 'Response message',
    example: 'Success'
  })
  message: string;

  @ApiProperty({
    description: 'Array of items',
    isArray: true
  })
  data: T[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto
  })
  meta: PaginationMetaDto;
}

/**
 * Error response
 */
export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Bad Request'
  })
  message: string;

  @ApiProperty({
    description: 'Detailed error information',
    example: 'Validation failed',
    oneOf: [
      { type: 'string' },
      { type: 'array', items: { type: 'string' } }
    ]
  })
  error: string | string[];

  @ApiPropertyOptional({
    description: 'Error timestamp',
    example: '2026-02-03T10:30:00.000Z'
  })
  timestamp?: string;

  @ApiPropertyOptional({
    description: 'Request path',
    example: '/api/users'
  })
  path?: string;
}

/**
 * Auth response with tokens
 */
export class AuthTokenResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ...'
  })
  accessToken: string;

  @ApiPropertyOptional({
    description: 'Token type',
    example: 'Bearer',
    default: 'Bearer'
  })
  tokenType?: string;

  @ApiPropertyOptional({
    description: 'Token expiration time in seconds',
    example: 3600
  })
  expiresIn?: number;
}
