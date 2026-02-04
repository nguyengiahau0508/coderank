import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OWNER_KEY, OwnerOptions } from '../decorators';

/**
 * Owner Guard
 * 
 * Ensures users can only access/modify their own resources.
 * Admins can bypass this restriction.
 * 
 * @example
 * ```typescript
 * @Owner('userId')  // Check if req.params.userId === req.user.userId
 * @UseGuards(JwtAuthGuard, OwnerGuard)
 * @Put('users/:userId')
 * updateUser(@Param('userId') userId: string) { ... }
 * ```
 */
@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const ownerOptions = this.reflector.getAllAndOverride<OwnerOptions>(OWNER_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no owner check is required, allow access
    if (!ownerOptions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Admin bypass - admins can access any resource
    if (user.roles?.includes('admin')) {
      return true;
    }

    const { paramKey, userKey = 'userId', allowAdminBypass = true } = ownerOptions;

    // Get resource owner ID from params or body
    const resourceOwnerId = request.params[paramKey] || request.body[paramKey];
    const currentUserId = user[userKey];

    if (!resourceOwnerId) {
      throw new ForbiddenException(`Resource identifier '${paramKey}' not found`);
    }

    if (resourceOwnerId !== currentUserId) {
      throw new ForbiddenException('You can only access your own resources');
    }

    return true;
  }
}
