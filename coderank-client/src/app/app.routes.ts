import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/callback',
    loadComponent: () => import('./features/auth/pages/callback/callback.component').then(m => m.CallbackComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/student/pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'problems',
        loadChildren: () => import('./features/problems/problems.routes').then(m => m.problemsRoutes)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
