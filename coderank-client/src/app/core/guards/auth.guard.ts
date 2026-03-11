import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree([getDashboardPath(authService.getPrimaryRole())]);
};

export function getDashboardPath(role: string | null): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'instructor':
      return '/lecturer/dashboard';
    case 'student':
      return '/student/problems';
    default:
      return '/';
  }
}
