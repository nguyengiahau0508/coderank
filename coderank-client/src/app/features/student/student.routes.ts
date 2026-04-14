import { Routes } from '@angular/router';

export const studentRoutes: Routes = [
  {
    path: '',
    redirectTo: 'courses/my-courses',
    pathMatch: 'full',
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
