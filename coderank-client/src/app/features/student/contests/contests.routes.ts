import { Routes } from '@angular/router';

export const studentContestsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./contest-list/contest-list.component').then(m => m.StudentContestListComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./contest-detail/contest-detail.component').then(m => m.StudentContestDetailComponent),
  },
];
