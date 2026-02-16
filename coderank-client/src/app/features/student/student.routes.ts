import { Routes } from '@angular/router';

export const studentRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.StudentDashboardComponent)
  },
  {
    path: 'problems',
    loadChildren: () => import('./problems/problems.routes').then(m => m.problemsRoutes)
  },
  {
    path: 'submissions',
    loadComponent: () => import('./pages/submissions/submissions.component').then(m => m.StudentSubmissionsComponent)
  },
  {
    path: 'contests',
    loadComponent: () => import('./pages/contests/contests.component').then(m => m.StudentContestsComponent)
  },
  {
    path: 'leaderboard',
    loadComponent: () => import('./pages/leaderboard/leaderboard.component').then(m => m.StudentLeaderboardComponent)
  }
];
