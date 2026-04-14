import { Routes } from '@angular/router';

export const lecturerRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.LecturerDashboardComponent)
  },
  {
    path: 'courses',
    loadComponent: () => import('./pages/courses/courses.component').then(m => m.LecturerCoursesComponent)
  },
  {
    path: 'problems',
    loadChildren: () => import('./problems/problems.routes').then(m => m.problemsRoutes)
  },
  {
    path: 'contests',
    loadChildren: () => import('./contests/contests.routes').then(m => m.lecturerContestsRoutes)
  },
  {
    path: 'ide',
    redirectTo: '/ide',
    pathMatch: 'full'
  },
  {
    path: 'students',
    loadComponent: () => import('./pages/students/students.component').then(m => m.LecturerStudentsComponent)
  },
  {
    path: 'grading',
    loadComponent: () => import('./pages/grading/grading.component').then(m => m.LecturerGradingComponent)
  },
  {
    path: 'analytics',
    loadComponent: () => import('./pages/analytics/analytics.component').then(m => m.LecturerAnalyticsComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('../settings/user-settings.component').then(m => m.UserSettingsComponent)
  }
];
