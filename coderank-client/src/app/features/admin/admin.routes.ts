import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(m => m.AdminDashboardComponent),
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./users/users.component').then(m => m.AdminUsersComponent),
  },
  {
    path: 'problems',
    loadChildren: () =>
      import('./problems/problems.routes').then(m => m.adminProblemsRoutes),
  },
  {
    path: 'contests',
    loadComponent: () =>
      import('./contests/contests.component').then(m => m.AdminContestsComponent),
  },
  {
    path: 'courses',
    loadChildren: () =>
      import('./courses/courses.routes').then(m => m.adminCoursesRoutes),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./settings/settings.component').then(m => m.AdminSettingsComponent),
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('./reports/reports.component').then(m => m.AdminReportsComponent),
  },
  {
    path: 'logs',
    loadComponent: () =>
      import('./logs/logs.component').then(m => m.AdminLogsComponent),
  },
];
