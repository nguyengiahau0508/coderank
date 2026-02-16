import { Routes } from '@angular/router';

export const problemsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./problems-list/problems-list.component').then(m => m.ProblemsListComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./problem-detail/problem-detail.component').then(m => m.ProblemDetailComponent),
  },
];
