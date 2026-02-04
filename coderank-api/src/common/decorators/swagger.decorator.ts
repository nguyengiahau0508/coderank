import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiExtraModels,
  getSchemaPath,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { ErrorResponseDto, PaginatedResponseDto } from '../dto/response.dto';

/**
 * Decorator for authenticated endpoints
 * Combines ApiBearerAuth with common unauthorized response
 */
export function ApiAuth() {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized - Invalid or expired token',
      type: ErrorResponseDto,
    }),
  );
}

/**
 * Decorator for standard success response
 */
export function ApiSuccessResponse(description: string, type?: any) {
  const decorators = [
    ApiResponse({
      status: HttpStatus.OK,
      description,
      type,
    }),
  ];
  return applyDecorators(...decorators);
}

/**
 * Decorator for created response (201)
 */
export function ApiCreatedResponse(description: string, type?: any) {
  return applyDecorators(
    ApiResponse({
      status: HttpStatus.CREATED,
      description,
      type,
    }),
  );
}

/**
 * Decorator for standard error responses
 * Includes common error status codes
 */
export function ApiErrorResponses() {
  return applyDecorators(
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Bad Request - Invalid input data',
      type: ErrorResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Resource not found',
      type: ErrorResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Internal server error',
      type: ErrorResponseDto,
    }),
  );
}

/**
 * Decorator for paginated list endpoints
 */
export function ApiPaginatedResponse(model: any) {
  return applyDecorators(
    ApiExtraModels(PaginatedResponseDto, model),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Paginated list retrieved successfully',
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedResponseDto) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  );
}

/**
 * Decorator for file upload endpoints
 */
export function ApiFileUpload(fieldName: string = 'file') {
  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          [fieldName]: {
            type: 'string',
            format: 'binary',
            description: 'File to upload',
          },
        },
        required: [fieldName],
      },
    }),
  );
}

/**
 * Decorator for multiple files upload
 */
export function ApiFilesUpload(fieldName: string = 'files', maxCount: number = 10) {
  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          [fieldName]: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary',
            },
            description: `Upload up to ${maxCount} files`,
          },
        },
        required: [fieldName],
      },
    }),
  );
}

/**
 * Complete CRUD operation decorator bundle
 * Use for standard CRUD endpoints
 */
export function ApiCrudOperation(
  operation: 'create' | 'read' | 'update' | 'delete' | 'list',
  resourceName: string,
  responseType?: any,
) {
  const operationConfig = {
    create: {
      summary: `Create ${resourceName}`,
      description: `Creates a new ${resourceName} record`,
      status: HttpStatus.CREATED,
    },
    read: {
      summary: `Get ${resourceName}`,
      description: `Retrieves a ${resourceName} by ID`,
      status: HttpStatus.OK,
    },
    update: {
      summary: `Update ${resourceName}`,
      description: `Updates an existing ${resourceName}`,
      status: HttpStatus.OK,
    },
    delete: {
      summary: `Delete ${resourceName}`,
      description: `Deletes a ${resourceName} by ID`,
      status: HttpStatus.OK,
    },
    list: {
      summary: `List ${resourceName}s`,
      description: `Retrieves a paginated list of ${resourceName}s`,
      status: HttpStatus.OK,
    },
  };

  const config = operationConfig[operation];

  const decorators = [
    ApiOperation({ summary: config.summary, description: config.description }),
    ApiResponse({
      status: config.status,
      description: `${resourceName} ${operation} successful`,
      type: responseType,
    }),
    ApiErrorResponses(),
  ];

  return applyDecorators(...decorators);
}
