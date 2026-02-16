import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-studentleaderboard',
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">Bảng xếp hạng</h1>
        <p class="mt-1 text-surface-500 dark:text-surface-400">Xem thứ hạng của bạn so với các sinh viên khác</p>
      </div>

      <!-- Leaderboard Table -->
      <div class="rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-800 overflow-hidden">
        <table class="w-full text-sm" aria-label="Bảng xếp hạng">
          <thead>
            <tr class="border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900">
              <th class="text-left px-4 py-2.5 font-medium text-surface-500 w-16">#</th>
              <th class="text-left px-4 py-2.5 font-medium text-surface-500">Người dùng</th>
              <th class="text-right px-4 py-2.5 font-medium text-surface-500 w-24">Điểm</th>
              <th class="text-right px-4 py-2.5 font-medium text-surface-500 w-24 hidden sm:table-cell">Bài giải</th>
            </tr>
          </thead>
          <tbody>
            @for (user of placeholderUsers; track user.rank) {
              <tr class="border-b border-surface-100 dark:border-surface-800 last:border-b-0 hover:bg-surface-50 dark:hover:bg-surface-900 transition-colors">
                <td class="px-4 py-2.5">
                  <span [class]="user.rank <= 3 ? 'font-bold text-amber-500' : 'text-surface-400'">{{ user.rank }}</span>
                </td>
                <td class="px-4 py-2.5">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">{{ user.name.charAt(0) }}</div>
                    <span class="font-medium text-surface-800 dark:text-surface-100">{{ user.name }}</span>
                  </div>
                </td>
                <td class="px-4 py-2.5 text-right font-semibold text-surface-900 dark:text-surface-0">{{ user.score }}</td>
                <td class="px-4 py-2.5 text-right text-surface-500 hidden sm:table-cell">{{ user.solved }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <p class="text-center text-xs text-surface-400"><i class="pi pi-info-circle mr-1"></i>Dữ liệu mẫu — Tính năng đầy đủ sẽ sớm được cập nhật</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StudentLeaderboardComponent {
  readonly placeholderUsers = [
    { rank: 1, name: 'Nguyễn Văn A', score: 1250, solved: 45 },
    { rank: 2, name: 'Trần Thị B', score: 1100, solved: 38 },
    { rank: 3, name: 'Lê Văn C', score: 980, solved: 32 },
    { rank: 4, name: 'Phạm Thị D', score: 850, solved: 28 },
    { rank: 5, name: 'Hoàng Văn E', score: 720, solved: 24 },
  ];
}
