import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-studentdashboard',
  imports: [RouterLink],
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">Dashboard</h1>
        <p class="mt-1 text-surface-500 dark:text-surface-400">Tổng quan học tập của bạn</p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        @for (stat of stats; track stat.label) {
          <div class="rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-800 p-4">
            <div class="flex items-center gap-3">
              <div [class]="'flex items-center justify-center w-9 h-9 rounded-lg ' + stat.color">
                <i [class]="'pi ' + stat.icon + ' text-white text-sm'"></i>
              </div>
              <div>
                <p class="text-lg font-bold text-surface-900 dark:text-surface-0">{{ stat.value }}</p>
                <p class="text-xs text-surface-400">{{ stat.label }}</p>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        @for (action of quickActions; track action.route) {
          <a
            [routerLink]="action.route"
            class="flex items-center gap-3 p-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-800 hover:border-primary/40 transition-colors group"
          >
            <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-700 group-hover:bg-primary/10 transition-colors">
              <i [class]="'pi ' + action.icon + ' text-surface-500 group-hover:text-primary transition-colors'"></i>
            </div>
            <div>
              <p class="text-sm font-medium text-surface-700 dark:text-surface-200">{{ action.label }}</p>
              <p class="text-xs text-surface-400">{{ action.description }}</p>
            </div>
          </a>
        }
      </div>

      <!-- Coming soon note -->
      <div class="rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-800 p-6 text-center">
        <div class="flex items-center justify-center w-12 h-12 rounded-full bg-surface-100 dark:bg-surface-700 mx-auto mb-3">
          <i class="pi pi-chart-bar text-xl text-surface-400"></i>
        </div>
        <p class="text-sm font-medium text-surface-600 dark:text-surface-300 mb-1">Thống kê chi tiết sẽ sớm được cập nhật</p>
        <p class="text-xs text-surface-400">Biểu đồ tiến độ học tập, lịch sử bài nộp và xếp hạng sẽ xuất hiện tại đây.</p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StudentDashboardComponent {
  readonly stats = [
    { label: 'Bài đã giải', value: '—', icon: 'pi-check-circle', color: 'bg-green-500' },
    { label: 'Bài nộp', value: '—', icon: 'pi-send', color: 'bg-blue-500' },
    { label: 'Điểm tổng', value: '—', icon: 'pi-star', color: 'bg-amber-500' },
    { label: 'Xếp hạng', value: '—', icon: 'pi-trophy', color: 'bg-violet-500' },
  ];

  readonly quickActions = [
    { label: 'Làm bài tập', icon: 'pi-code', route: '/student/problems', description: 'Xem danh sách bài' },
    { label: 'Cuộc thi', icon: 'pi-trophy', route: '/student/contests', description: 'Tham gia contest' },
    { label: 'Bảng xếp hạng', icon: 'pi-star', route: '/student/leaderboard', description: 'Xem thứ hạng' },
  ];
}
