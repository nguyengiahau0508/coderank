import { Routes } from '@angular/router';

export const studentCoursesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./course-list/course-list.component').then(m => m.StudentCourseListComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./course-detail/course-detail.component').then(m => m.StudentCourseDetailComponent),
  },
  {
    path: ':id/sections/:sectionId/lessons/:lessonId',
    loadComponent: () =>
      import('./lesson-detail/lesson-detail.component').then(m => m.StudentLessonDetailComponent),
  },
];
