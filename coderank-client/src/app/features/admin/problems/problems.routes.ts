import { Routes } from '@angular/router';
import { ProblemsListComponent } from './problems-list/problems-list.component';
import { ProblemDetailComponent } from './problem-detail/problem-detail.component';

export const problemsRoutes: Routes = [
  {
    path: '',
    component: ProblemsListComponent,
  },
  {
    path: ':id',
    component: ProblemDetailComponent,
  },
];
