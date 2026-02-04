import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleEnum } from 'src/common/enums/enums';
import { ROLES_KEY } from '../decorators';

/**
 * Roles Guard
 * 
 * Implements role-based access control (RBAC)
 * Use with @Roles() decorator to restrict access to specific roles
 * 
 * @example
 * ```typescript
 * @Roles(RoleEnum.Admin, RoleEnum.Instructor)
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Get('admin-only')
 * getAdminData() { ... }
 * ```
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not found in request');
    }

    if (!user.roles || !Array.isArray(user.roles)) {
      throw new ForbiddenException('User has no roles assigned');
    }

    const hasRole = requiredRoles.some((role) => user.roles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
