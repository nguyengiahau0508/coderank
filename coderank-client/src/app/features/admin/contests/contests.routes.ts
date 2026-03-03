import { Routes } from '@angular/router';

export const adminContestsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./contest-list/contest-list.component').then(m => m.AdminContestListComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./contest-detail/contest-detail.component').then(m => m.AdminContestDetailComponent),
  },
];
