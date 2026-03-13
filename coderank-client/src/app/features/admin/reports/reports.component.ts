import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-admin-reports',
  templateUrl: './reports.component.html',
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
