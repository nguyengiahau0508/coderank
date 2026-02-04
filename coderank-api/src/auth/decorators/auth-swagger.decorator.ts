import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiOAuth2,
  ApiExcludeEndpoint,
  ApiBearerAuth,
} from '@nestjs/swagger';

/**
 * Decorator cho endpoint khởi tạo Google OAuth2 flow
 */
export function ApiGoogleAuth() {
  return applyDecorators(
    ApiOperation({
      summary: 'Đăng nhập với Google',
      description:
        'Khởi tạo OAuth2 flow để đăng nhập với tài khoản Google. Người dùng sẽ được chuyển hướng đến trang đăng nhập Google.',
    }),
    ApiResponse({
      status: HttpStatus.FOUND,
      description: 'Redirect to Google OAuth consent screen',
    }),
    ApiOAuth2(['email', 'profile'], 'Google-OAuth2'),
  );
}

/**
 * Decorator cho Google OAuth2 callback endpoint
 */
export function ApiGoogleCallback() {
  return applyDecorators(
    ApiOperation({
      summary: 'Google OAuth2 Callback',
      description:
        'Endpoint xử lý callback từ Google sau khi người dùng xác thực. Trả về JWT tokens.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Authentication successful',
      schema: {
        type: 'object',
        properties: {
          accessToken: {
            type: 'string',
            description: 'JWT access token',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Authentication failed - Invalid credentials or token',
    }),
    ApiExcludeEndpoint(), // Exclude from main docs as it's a callback
  );
}

/**
 * Decorator cho endpoint khởi tạo GitHub OAuth2 flow
 */
export function ApiGithubAuth() {
  return applyDecorators(
    ApiOperation({
      summary: 'Đăng nhập với GitHub',
      description:
        'Khởi tạo OAuth2 flow để đăng nhập với tài khoản GitHub. Người dùng sẽ được chuyển hướng đến trang đăng nhập GitHub.',
    }),
    ApiResponse({
      status: HttpStatus.FOUND,
      description: 'Redirect to GitHub OAuth consent screen',
    }),
    ApiOAuth2(['user:email', 'read:user'], 'GitHub-OAuth2'),
  );
}

/**
 * Decorator cho GitHub OAuth2 callback endpoint
 */
export function ApiGithubCallback() {
  return applyDecorators(
    ApiOperation({
      summary: 'GitHub OAuth2 Callback',
      description:
        'Endpoint xử lý callback từ GitHub sau khi người dùng xác thực. Trả về JWT tokens.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Authentication successful',
      schema: {
        type: 'object',
        properties: {
          accessToken: {
            type: 'string',
            description: 'JWT access token',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Authentication failed - Invalid credentials or token',
    }),
    ApiExcludeEndpoint(),
  );
}

/**
 * Decorator cho endpoint refresh token
 */
export function ApiRefreshToken() {
  return applyDecorators(
    ApiOperation({
      summary: 'Refresh Access Token',
      description: 'Sử dụng refresh token để lấy access token mới.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Token refreshed successfully',
      schema: {
        type: 'object',
        properties: {
          accessToken: {
            type: 'string',
            description: 'New JWT access token',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Invalid or expired refresh token',
    }),
  );
}

/**
 * Decorator cho endpoint logout
 */
export function ApiLogout() {
  return applyDecorators(
    ApiOperation({
      summary: 'Đăng xuất',
      description: 'Đăng xuất người dùng và xóa refresh token.',
    }),
    ApiBearerAuth('JWT-auth'),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Logout successful',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Not authenticated',
    }),
  );
}

export function ApiProtectedResource(summary: string, description: string) {
  return applyDecorators(
    ApiOperation({ summary, description }),
    ApiBearerAuth('JWT-auth'),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Not authenticated',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Insufficient permissions',
    }),
  );
}