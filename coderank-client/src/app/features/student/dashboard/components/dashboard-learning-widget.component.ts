import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import {
  CourseLevelEnum,
  StudentDashboardModel,
} from '../../../../data';

@Component({
  selector: 'app-dashboard-learning-widget',
  imports: [CommonModule, RouterLink, Tag, Button],
  template: `
    <section class="rounded-xl p-4" style="background: var(--cr-bg-secondary); border: 1px solid var(--cr-border);">
      <div class="flex items-center justify-between gap-3 mb-3">
        <h2 class="text-sm font-semibold" style="color: var(--cr-text-primary);">Khóa học đang học</h2>
        <a routerLink="/student/courses/my-courses" class="text-xs font-medium hover:opacity-80" style="color: var(--cr-accent-blue);">Xem tất cả</a>
      </div>

      @if (courses().length > 0) {
        <div class="space-y-3">
          @for (course of courses(); track course.id) {
            <a
              [routerLink]="'/student/courses/' + course.id"
              class="block rounded-lg p-3 transition-colors hover:brightness-110"
              style="background: var(--cr-bg-primary); border: 1px solid var(--cr-border);"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="text-sm font-semibold truncate" style="color: var(--cr-text-primary);">{{ course.title }}</p>
                  <div class="mt-1 flex items-center gap-2 flex-wrap">
                    <p-tag
                      [value]="getCourseLevelLabel(course.level)"
                      [severity]="getCourseLevelSeverity(course.level)"
                      styleClass="text-[10px]"
                    />
                    <span class="text-[11px]" style="color: var(--cr-text-subtle);">
                      {{ course.enrollment.completedLessons || 0 }}/{{ course.enrollment.totalLessons || 0 }} bài
                    </span>
                  </div>
                </div>
                <span class="text-xs font-semibold" style="color: var(--cr-accent-green);">
                  {{ course.enrollment.progressPercent | number:'1.0-0' }}%
                </span>
              </div>
              <div class="mt-2 h-1.5 rounded-full overflow-hidden" style="background: var(--cr-bg-tertiary);">
                <div
                  class="h-full rounded-full"
                  style="background: linear-gradient(90deg, var(--cr-accent-blue), var(--cr-accent-green));"
                  [style.width.%]="course.enrollment.progressPercent"
                ></div>
              </div>
            </a>
          }
        </div>
      } @else {
        <div class="rounded-lg p-8 text-center" style="background: var(--cr-bg-primary); border: 1px dashed var(--cr-border);">
          <i class="pi pi-book text-2xl" style="color: var(--cr-text-subtle);"></i>
          <p class="text-sm mt-2" style="color: var(--cr-text-muted);">Bạn chưa đăng ký khóa học nào.</p>
          <p-button label="Khám phá khóa học" icon="pi pi-compass" styleClass="mt-3" routerLink="/student/courses/explore" />
        </div>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardLearningWidgetComponent {
  readonly courses =
    input<StudentDashboardModel['learning']['recentCourses']>([]);

  getCourseLevelLabel(level: CourseLevelEnum): string {
    switch (level) {
      case CourseLevelEnum.Beginner:
        return 'Cơ bản';
      case CourseLevelEnum.Intermediate:
        return 'Trung cấp';
      case CourseLevelEnum.Advanced:
        return 'Nâng cao';
      default:
        return level;
    }
  }

  getCourseLevelSeverity(level: CourseLevelEnum): 'success' | 'info' | 'warn' {
    switch (level) {
      case CourseLevelEnum.Beginner:
        return 'success';
      case CourseLevelEnum.Intermediate:
        return 'info';
      case CourseLevelEnum.Advanced:
        return 'warn';
      default:
        return 'info';
    }
  }
}
