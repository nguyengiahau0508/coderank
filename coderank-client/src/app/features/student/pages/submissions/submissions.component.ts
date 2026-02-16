import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-studentsubmissions',
  imports: [Tag],
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">Bài nộp của tôi</h1>
        <p class="mt-1 text-surface-500 dark:text-surface-400">Theo dõi các bài đã nộp và kết quả</p>
      </div>

      <!-- Submissions List -->
      <div class="rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-800 overflow-hidden">
        @for (sub of submissions; track sub.id) {
          <div class="px-4 py-3 border-b border-surface-100 dark:border-surface-800 last:border-b-0 hover:bg-surface-50 dark:hover:bg-surface-900 transition-colors">
            <div class="flex items-center justify-between">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-surface-900 dark:text-surface-0 truncate">{{ sub.problem }}</p>
                <div class="flex items-center gap-3 mt-1 text-xs text-surface-400">
                  <span>{{ sub.language }}</span>
                  <span>{{ sub.time }}</span>
                </div>
              </div>
              <div class="flex items-center gap-3 flex-shrink-0">
                <span class="text-xs text-surface-500">{{ sub.tests }}</span>
                <p-tag [value]="sub.status" [severity]="sub.status === 'Accepted' ? 'success' : 'danger'" styleClass="text-xs" />
              </div>
            </div>
          </div>
        }
      </div>

      <p class="text-center text-xs text-surface-400"><i class="pi pi-info-circle mr-1"></i>Dữ liệu mẫu — Tính năng đầy đủ sẽ sớm được cập nhật</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StudentSubmissionsComponent {
  readonly submissions = [
    { id: 1, problem: 'Two Sum', language: 'Python', status: 'Accepted', tests: '5/5', time: '16/02/2026 10:30' },
    { id: 2, problem: 'Binary Search', language: 'C++', status: 'Wrong Answer', tests: '3/7', time: '16/02/2026 09:15' },
    { id: 3, problem: 'Linked List Cycle', language: 'Java', status: 'Accepted', tests: '4/4', time: '15/02/2026 14:22' },
    { id: 4, problem: 'Merge Sort', language: 'Python', status: 'Time Limit', tests: '6/10', time: '15/02/2026 11:00' },
  ];
}
