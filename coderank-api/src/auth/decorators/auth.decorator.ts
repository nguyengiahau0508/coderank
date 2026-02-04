import { SetMetadata, applyDecorators, UseGuards } from '@nestjs/common';
import { RoleEnum } from 'src/common/enums/enums';
import { JwtAuthGuard, RolesGuard, ThrottleGuard, OwnerGuard } from '../guard';

// ============ Keys ============

export const IS_PUBLIC_KEY = 'isPublic';
export const ROLES_KEY = 'roles';
export const OWNER_KEY = 'owner';
export const THROTTLE_KEY = 'throttle';

// ============ Interfaces ============

export interface OwnerOptions {
  /** The param/body key containing the resource owner's ID */
  paramKey: string;
  /** The user property to compare against (default: 'userId') */
  userKey?: string;
  /** Allow admins to bypass the check (default: true) */
  allowAdminBypass?: boolean;
}

export interface ThrottleOptions {
  /** Maximum number of requests */
  limit: number;
  /** Time window in seconds */
  ttl: number;
}

// ============ Simple Decorators ============

/**
 * Mark endpoint as public (no authentication required)
 * 
 * @example
 * ```typescript
 * @Public()
 * @Get('health')
 * healthCheck() { return 'OK'; }
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Require specific roles to access endpoint
 * 
 * @example
 * ```typescript
 * @Roles(RoleEnum.Admin)
 * @Get('admin/users')
 * getAllUsers() { ... }
 * ```
 */
export const Roles = (...roles: RoleEnum[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Resource owner check - user can only access their own resources
 * 
 * @example
 * ```typescript
 * @Owner('userId')
 * @Put('users/:userId')
 * updateUser() { ... }
 * ```
 */
export const Owner = (paramKey: string, options?: Partial<Omit<OwnerOptions, 'paramKey'>>) =>
  SetMetadata(OWNER_KEY, { paramKey, ...options });

/**
 * Rate limiting decorator
 * 
 * @example
 * ```typescript
 * @Throttle({ limit: 5, ttl: 60 })  // 5 requests per minute
 * @Post('submissions')
 * createSubmission() { ... }
 * ```
 */
export const Throttle = (options: ThrottleOptions) => SetMetadata(THROTTLE_KEY, options);

// ============ Combined Decorators ============

/**
 * Require authentication
 * Combines JwtAuthGuard
 * 
 * @example
 * ```typescript
 * @Auth()
 * @Get('profile')
 * getProfile() { ... }
 * ```
 */
export const Auth = () => applyDecorators(UseGuards(JwtAuthGuard));

/**
 * Require authentication with specific roles
 * Combines JwtAuthGuard + RolesGuard
 * 
 * @example
 * ```typescript
 * @AuthRoles(RoleEnum.Admin, RoleEnum.Instructor)
 * @Get('admin/dashboard')
 * getDashboard() { ... }
 * ```
 */
export const AuthRoles = (...roles: RoleEnum[]) =>
  applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    UseGuards(JwtAuthGuard, RolesGuard),
  );

/**
 * Admin only access
 * Shorthand for @AuthRoles(RoleEnum.Admin)
 * 
 * @example
 * ```typescript
 * @AdminOnly()
 * @Delete('users/:id')
 * deleteUser() { ... }
 * ```
 */
export const AdminOnly = () => AuthRoles(RoleEnum.Admin);

/**
 * Instructor or Admin access
 * 
 * @example
 * ```typescript
 * @InstructorAccess()
 * @Post('problems')
 * createProblem() { ... }
 * ```
 */
export const InstructorAccess = () => AuthRoles(RoleEnum.Admin, RoleEnum.Instructor);

/**
 * Owner or Admin access - user can only access their own resources
 * Combines JwtAuthGuard + OwnerGuard
 * 
 * @example
 * ```typescript
 * @OwnerAccess('userId')
 * @Put('users/:userId')
 * updateProfile() { ... }
 * ```
 */
export const OwnerAccess = (paramKey: string) =>
  applyDecorators(
    SetMetadata(OWNER_KEY, { paramKey }),
    UseGuards(JwtAuthGuard, OwnerGuard),
  );

/**
 * Rate limited endpoint
 * 
 * @example
 * ```typescript
 * @RateLimited(10, 60)  // 10 requests per minute
 * @Post('submissions')
 * createSubmission() { ... }
 * ```
 */
export const RateLimited = (limit: number, ttl: number) =>
  applyDecorators(
    SetMetadata(THROTTLE_KEY, { limit, ttl }),
    UseGuards(ThrottleGuard),
  );

/**
 * Auth + Rate limited
 * Common combination for protected endpoints with rate limiting
 * 
 * @example
 * ```typescript
 * @AuthThrottled(5, 60)  // Authenticated, max 5 requests per minute
 * @Post('submissions')
 * createSubmission() { ... }
 * ```
 */
export const AuthThrottled = (limit: number, ttl: number) =>
  applyDecorators(
    SetMetadata(THROTTLE_KEY, { limit, ttl }),
    UseGuards(JwtAuthGuard, ThrottleGuard),
  );
