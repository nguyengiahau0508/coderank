import { Routes } from '@angular/router';

export const adminProblemsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/problem-list/problem-list.component').then(m => m.AdminProblemListComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/problem-detail/problem-detail.component').then(m => m.AdminProblemDetailComponent),
  },
];
