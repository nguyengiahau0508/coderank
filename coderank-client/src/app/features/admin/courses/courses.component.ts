import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-admin-courses',
  imports: [Button, Tag],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">Khóa học</h1>
          <p class="mt-1 text-surface-500 dark:text-surface-400">Quản lý khóa học và nội dung giảng dạy</p>
        </div>
        <p-button label="Tạo khóa học" icon="pi pi-plus" severity="primary" />
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        @for (s of stats; track s.label) {
          <div class="flex items-center gap-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-800 p-4">
            <div [class]="'flex items-center justify-center w-10 h-10 rounded-lg ' + s.color">
              <i [class]="'pi ' + s.icon + ' text-white'"></i>
            </div>
            <div>
              <p class="text-xl font-bold text-surface-900 dark:text-surface-0">{{ s.value }}</p>
              <p class="text-xs text-surface-400">{{ s.label }}</p>
            </div>
          </div>
        }
      </div>

      <!-- Course Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (course of courses; track course.title) {
          <div class="rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-800 overflow-hidden transition-shadow hover:shadow-md">
            <div [class]="'h-2 ' + course.color"></div>
            <div class="p-5">
              <div class="flex items-start justify-between mb-2">
                <h3 class="text-base font-semibold text-surface-900 dark:text-surface-0">{{ course.title }}</h3>
                <p-tag [value]="course.status" [severity]="course.status === 'Đang mở' ? 'success' : 'secondary'" />
              </div>
              <p class="text-xs text-surface-400 mb-4">{{ course.instructor }}</p>
              <div class="flex items-center justify-between text-xs text-surface-500">
                <span><i class="pi pi-users mr-1"></i>{{ course.students }} SV</span>
                <span><i class="pi pi-book mr-1"></i>{{ course.lessons }} bài học</span>
              </div>
            </div>
          </div>
        }
      </div>

      <p class="text-center text-xs text-surface-400"><i class="pi pi-info-circle mr-1"></i>Dữ liệu mẫu — Tính năng đầy đủ sẽ sớm được cập nhật</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCoursesComponent {
  readonly stats = [
    { label: 'Tổng khóa học', value: '—', icon: 'pi-book', color: 'bg-indigo-500' },
    { label: 'Đang hoạt động', value: '—', icon: 'pi-check-circle', color: 'bg-green-500' },
    { label: 'Tổng sinh viên', value: '—', icon: 'pi-users', color: 'bg-blue-500' },
  ];

  readonly courses = [
    { title: 'Cấu trúc dữ liệu & Giải thuật', status: 'Đang mở', instructor: 'GV. Nguyễn Văn A', students: 45, lessons: 12, color: 'bg-blue-500' },
    { title: 'Lập trình hướng đối tượng', status: 'Đang mở', instructor: 'GV. Trần Thị B', students: 38, lessons: 10, color: 'bg-emerald-500' },
    { title: 'Nhập môn lập trình', status: 'Đã kết thúc', instructor: 'GV. Lê Văn C', students: 60, lessons: 15, color: 'bg-amber-500' },
  ];
}
