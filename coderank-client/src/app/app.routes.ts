import { Routes } from '@angular/router';
import { guestGuard, studentGuard, lecturerGuard, adminGuard, smartRedirectGuard } from './core/guards';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/callback',
    loadComponent: () => import('./features/auth/pages/callback/callback.component').then(m => m.CallbackComponent)
  },
  {
    path: 'student',
    canActivate: [studentGuard],
    loadComponent: () => import('./layouts/student/student-layout.component').then(m => m.StudentLayoutComponent),
    loadChildren: () => import('./features/student/student.routes').then(m => m.studentRoutes)
  },
  {
    path: 'lecturer',
    canActivate: [lecturerGuard],
    loadComponent: () => import('./layouts/lecturer/lecturer-layout.component').then(m => m.LecturerLayoutComponent),
    loadChildren: () => import('./features/lecturer/lecturer.routes').then(m => m.lecturerRoutes)
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./layouts/admin/admin-layout.component').then(m => m.AdminLayoutComponent),
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes)
  },
  {
    path: '',
    canActivate: [smartRedirectGuard],
    pathMatch: 'full',
    children: []
  },
  {
    path: '**',
    redirectTo: ''
  }
];
