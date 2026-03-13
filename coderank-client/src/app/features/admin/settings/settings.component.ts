import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-admin-settings',
  imports: [Button],
  templateUrl: './settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSettingsComponent {
  readonly sections = [
    { title: 'Cài đặt chung', description: 'Tên hệ thống, ngôn ngữ, múi giờ', icon: 'pi-cog', color: 'bg-blue-500' },
    { title: 'Bảo mật', description: 'Xác thực, OAuth, phiên đăng nhập', icon: 'pi-shield', color: 'bg-red-500' },
    { title: 'Judge Server', description: 'Cấu hình máy chấm, giới hạn tài nguyên', icon: 'pi-server', color: 'bg-violet-500' },
    { title: 'Email & Thông báo', description: 'SMTP, template email, push notification', icon: 'pi-envelope', color: 'bg-amber-500' },
    { title: 'Sao lưu & Phục hồi', description: 'Lịch sao lưu tự động, xuất dữ liệu', icon: 'pi-database', color: 'bg-emerald-500' },
  ];
}
