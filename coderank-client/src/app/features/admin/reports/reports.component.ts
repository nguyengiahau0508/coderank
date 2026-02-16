import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-admin-reports',
  template: `
    <div class="space-y-4">
      <div>
        <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">Báo cáo</h1>
        <p class="mt-1 text-surface-500 dark:text-surface-400">Thống kê và phân tích hoạt động hệ thống</p>
      </div>

      <!-- Report Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (report of reports; track report.title) {
          <div class="rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-800 p-4 transition-shadow hover:shadow-md cursor-pointer">
            <div class="flex items-center gap-3 mb-3">
              <div [class]="'flex items-center justify-center w-10 h-10 rounded-lg ' + report.color">
                <i [class]="'pi ' + report.icon + ' text-white'"></i>
              </div>
              <div>
                <h3 class="text-base font-semibold text-surface-900 dark:text-surface-0">{{ report.title }}</h3>
                <p class="text-xs text-surface-400">{{ report.description }}</p>
              </div>
            </div>
            <!-- chart placeholder -->
            <div class="h-32 rounded-lg bg-surface-50 dark:bg-surface-900 flex items-center justify-center">
              <span class="text-xs text-surface-300"><i class="pi pi-chart-line mr-1"></i>Biểu đồ sẽ hiển thị ở đây</span>
            </div>
          </div>
        }
      </div>

      <p class="text-center text-xs text-surface-400"><i class="pi pi-info-circle mr-1"></i>Tính năng đang được phát triển</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminReportsComponent {
  readonly reports = [
    { title: 'Thống kê bài nộp', description: 'Số lượng submission theo ngày/tuần', icon: 'pi-send', color: 'bg-blue-500' },
    { title: 'Phân bố độ khó', description: 'Tỉ lệ accepted theo mức độ khó', icon: 'pi-chart-pie', color: 'bg-violet-500' },
    { title: 'Người dùng hoạt động', description: 'Người dùng active trong 30 ngày qua', icon: 'pi-users', color: 'bg-emerald-500' },
    { title: 'Hiệu suất hệ thống', description: 'Thời gian chấm trung bình, uptime', icon: 'pi-gauge', color: 'bg-amber-500' },
  ];
}
