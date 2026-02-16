import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-studentcontests',
  imports: [Tag],
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">Cuộc thi</h1>
        <p class="mt-1 text-surface-500 dark:text-surface-400">Tham gia các cuộc thi lập trình</p>
      </div>

      <!-- Contest Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        @for (contest of contests; track contest.title) {
          <div class="rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-800 p-4 hover:border-primary/40 transition-colors cursor-pointer">
            <div class="flex items-start justify-between mb-2">
              <p-tag [value]="contest.status" [severity]="contest.status === 'Đang diễn ra' ? 'success' : contest.status === 'Sắp tới' ? 'info' : 'secondary'" />
              <span class="text-xs text-surface-400">{{ contest.date }}</span>
            </div>
            <h3 class="text-sm font-semibold text-surface-900 dark:text-surface-0 mb-1">{{ contest.title }}</h3>
            <div class="flex items-center gap-4 text-xs text-surface-500 mt-2">
              <span><i class="pi pi-users mr-1"></i>{{ contest.participants }} người</span>
              <span><i class="pi pi-code mr-1"></i>{{ contest.problems }} bài</span>
            </div>
          </div>
        }
      </div>

      <p class="text-center text-xs text-surface-400"><i class="pi pi-info-circle mr-1"></i>Dữ liệu mẫu — Tính năng đầy đủ sẽ sớm được cập nhật</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StudentContestsComponent {
  readonly contests = [
    { title: 'CodeRank Weekly #1', status: 'Đang diễn ra', date: '15/02 - 22/02', participants: 45, problems: 5 },
    { title: 'Thi cuối kỳ - CTDL&GT', status: 'Sắp tới', date: '01/03/2026', participants: 0, problems: 8 },
    { title: 'Luyện tập OOP', status: 'Đã kết thúc', date: '01/02 - 08/02', participants: 32, problems: 4 },
  ];
}
