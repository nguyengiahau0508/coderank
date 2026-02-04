import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators';
import { RolesEnum } from 'src/common/enums/enums';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RolesEnum[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();

    const userRoles = (user?.roles ?? []).map((r: string) => r?.trim().toLowerCase());
    const normalizedRequired = requiredRoles.map((r) => String(r).trim().toLowerCase());
    const hasRequiredRole = normalizedRequired.some((role) => userRoles.includes(role));

    return hasRequiredRole;
  }
}