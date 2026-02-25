import { Routes } from '@angular/router';

export const adminCoursesRoutes: Routes = [
  { path: '', loadComponent: () => import('./course-list/course-list.component').then(m => m.AdminCourseListComponent) },
  { path: ':id', loadComponent: () => import('./course-detail/course-detail.component').then(m => m.AdminCourseDetailComponent) },
  { path: ':id/sections/:sectionId/lessons/:lessonId', loadComponent: () => import('./lesson-detail/lesson-detail.component').then(m => m.AdminLessonDetailComponent) },
];
