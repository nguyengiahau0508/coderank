import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const smartRedirectGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  const primaryRole = authService.getPrimaryRole();
  
  switch (primaryRole) {
    case 'admin':
      return router.createUrlTree(['/admin/dashboard']);
    case 'instructor':
      return router.createUrlTree(['/lecturer/dashboard']);
    case 'student':
      return router.createUrlTree(['/student/dashboard']);
    default:
      return router.createUrlTree(['/login']);
  }
};
