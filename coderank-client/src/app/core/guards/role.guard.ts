import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      return router.createUrlTree(['/login']);
    }

    if (authService.hasAnyRole(allowedRoles)) {
      return true;
    }

    // Redirect to appropriate dashboard based on user's primary role
    const primaryRole = authService.getPrimaryRole();
    if (primaryRole) {
      return router.createUrlTree([`/${primaryRole}/dashboard`]);
    }

    return router.createUrlTree(['/unauthorized']);
  };
};

export const studentGuard: CanActivateFn = roleGuard(['student']);
export const lecturerGuard: CanActivateFn = roleGuard(['instructor']);
export const adminGuard: CanActivateFn = roleGuard(['admin']);
