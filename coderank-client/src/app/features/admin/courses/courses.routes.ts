import { Routes } from '@angular/router';

export const coursesRoutes: Routes = [
  { path: '', loadComponent: () => import('./course-list/course-list.component').then(m => m.CourseListComponent) },
  { path: ':id', loadComponent: () => import('./course-detail/course-detail.component').then(m => m.CourseDetailComponent) },
  { path: ':id/sections/:sectionId/lessons/:lessonId', loadComponent: () => import('./lesson-detail/lesson-detail.component').then(m => m.LessonDetailComponent) },
];
