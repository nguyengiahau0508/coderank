import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

interface StatCard {
  label: string;
  value: string;
  icon: string;
  trend: string;
  trendUp: boolean;
  color: string;
}

interface QuickAction {
  label: string;
  icon: string;
  route: string;
  description: string;
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink],
  template: `
    <div class="space-y-5">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">Dashboard</h1>
        <p class="mt-1 text-surface-500 dark:text-surface-400">Tổng quan hệ thống và thống kê hoạt động</p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        @for (stat of stats; track stat.label) {
          <div class="rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-800 p-4 transition-shadow hover:shadow-md">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-surface-500 dark:text-surface-400">{{ stat.label }}</span>
              <div [class]="'flex items-center justify-center w-10 h-10 rounded-lg ' + stat.color">
                <i [class]="'pi ' + stat.icon + ' text-lg text-white'"></i>
              </div>
            </div>
            <div class="text-2xl font-bold text-surface-900 dark:text-surface-0 mb-1">{{ stat.value }}</div>
            <div class="flex items-center gap-1.5 text-xs">
              <span [class]="stat.trendUp ? 'text-green-600' : 'text-red-500'">
                <i [class]="'pi ' + (stat.trendUp ? 'pi-arrow-up-right' : 'pi-arrow-down-right')"></i>
                {{ stat.trend }}
              </span>
              <span class="text-surface-400">so với tháng trước</span>
            </div>
          </div>
        }
      </div>

      <!-- Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Recent Activity -->
        <div class="lg:col-span-2 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-800 p-4">
          <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-3">Hoạt động gần đây</h2>
          <div class="space-y-4">
            @for (activity of recentActivities; track activity.time) {
              <div class="flex items-start gap-3">
                <div [class]="'flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ' + activity.color">
                  <i [class]="'pi ' + activity.icon + ' text-xs text-white'"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-surface-700 dark:text-surface-300">{{ activity.message }}</p>
                  <span class="text-xs text-surface-400">{{ activity.time }}</span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-800 p-4">
          <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-3">Thao tác nhanh</h2>
          <div class="space-y-2">
            @for (action of quickActions; track action.route) {
              <a
                [routerLink]="action.route"
                class="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-surface-100 dark:hover:bg-surface-700 group"
              >
                <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-surface-100 dark:bg-surface-700 group-hover:bg-primary/10 transition-colors">
                  <i [class]="'pi ' + action.icon + ' text-surface-500 group-hover:text-primary transition-colors'"></i>
                </div>
                <div>
                  <p class="text-sm font-medium text-surface-700 dark:text-surface-200">{{ action.label }}</p>
                  <p class="text-xs text-surface-400">{{ action.description }}</p>
                </div>
              </a>
            }
          </div>
        </div>
      </div>

      <!-- System Status -->
      <div class="rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-800 p-4">
        <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-3">Trạng thái hệ thống</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          @for (status of systemStatuses; track status.label) {
            <div class="flex items-center gap-3">
              <div [class]="'w-2.5 h-2.5 rounded-full ' + status.statusColor"></div>
              <div>
                <p class="text-sm font-medium text-surface-700 dark:text-surface-300">{{ status.label }}</p>
                <p class="text-xs text-surface-400">{{ status.description }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent {
  readonly stats: StatCard[] = [
    { label: 'Tổng bài tập', value: '—', icon: 'pi-code', trend: '—', trendUp: true, color: 'bg-blue-500' },
    { label: 'Người dùng', value: '—', icon: 'pi-users', trend: '—', trendUp: true, color: 'bg-emerald-500' },
    { label: 'Bài nộp hôm nay', value: '—', icon: 'pi-send', trend: '—', trendUp: false, color: 'bg-violet-500' },
    { label: 'Cuộc thi', value: '—', icon: 'pi-trophy', trend: '—', trendUp: true, color: 'bg-amber-500' },
  ];

  readonly recentActivities = [
    { icon: 'pi-plus', color: 'bg-blue-500', message: 'Hệ thống sẵn sàng. Dữ liệu sẽ được cập nhật khi kết nối API.', time: 'Vừa xong' },
    { icon: 'pi-users', color: 'bg-emerald-500', message: 'Module quản lý người dùng đang được phát triển.', time: '—' },
    { icon: 'pi-chart-bar', color: 'bg-violet-500', message: 'Thống kê chi tiết sẽ sớm khả dụng.', time: '—' },
  ];

  readonly quickActions: QuickAction[] = [
    { label: 'Tạo bài tập', icon: 'pi-plus-circle', route: '/admin/problems', description: 'Thêm bài tập mới' },
    { label: 'Quản lý người dùng', icon: 'pi-users', route: '/admin/users', description: 'Xem & quản lý' },
    { label: 'Tạo cuộc thi', icon: 'pi-trophy', route: '/admin/contests', description: 'Khởi tạo contest' },
    { label: 'Xem báo cáo', icon: 'pi-chart-bar', route: '/admin/reports', description: 'Thống kê hệ thống' },
    { label: 'Cài đặt', icon: 'pi-cog', route: '/admin/settings', description: 'Cấu hình hệ thống' },
  ];

  readonly systemStatuses = [
    { label: 'API Server', description: 'Đang hoạt động', statusColor: 'bg-green-500' },
    { label: 'Judge Server', description: 'Đang hoạt động', statusColor: 'bg-green-500' },
    { label: 'Database', description: 'Đang hoạt động', statusColor: 'bg-green-500' },
  ];
}
