import { Routes } from '@angular/router';

export const problemsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./problem-list/problem-list.component').then(m => m.ProblemListComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./problem-detail/problem-detail.component').then(m => m.AdminProblemDetailComponent),
  },
];
