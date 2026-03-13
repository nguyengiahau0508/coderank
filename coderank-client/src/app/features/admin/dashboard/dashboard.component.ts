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
  templateUrl: './dashboard.component.html',
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
