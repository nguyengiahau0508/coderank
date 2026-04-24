import { Routes } from '@angular/router';

export const studentRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(m => m.StudentDashboardComponent),
  },
  {
    path: 'problems',
    loadChildren: () =>
      import('./problems/problems.routes').then(m => m.studentProblemsRoutes),
  },
  {
    path: 'courses',
    loadChildren: () =>
      import('./courses/courses.routes').then(m => m.studentCoursesRoutes),
  },
  {
    path: 'contests',
    loadChildren: () =>
      import('./contests/contests.routes').then(m => m.studentContestsRoutes),
  },
  {
    path: 'ide',
    redirectTo: '/ide',
    pathMatch: 'full',
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('../settings/user-settings.component').then(m => m.UserSettingsComponent),
  },
];
