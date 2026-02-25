import { Routes } from '@angular/router';

export const studentRoutes: Routes = [
  {
    path: '',
    redirectTo: 'problems',
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
];
