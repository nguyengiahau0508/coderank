import { Routes } from '@angular/router';

export const lecturerContestsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./contest-list/contest-list.component').then(m => m.LecturerContestListComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./contest-detail/contest-detail.component').then(m => m.LecturerContestDetailComponent),
  },
];
