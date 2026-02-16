import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-admin-settings',
  imports: [Button],
  template: `
    <div class="space-y-4">
      <div>
        <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">Cài đặt</h1>
        <p class="mt-1 text-surface-500 dark:text-surface-400">Cấu hình hệ thống và tùy chỉnh</p>
      </div>

      <!-- Settings Sections -->
      <div class="space-y-4">
        @for (section of sections; track section.title) {
          <div class="rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-800 p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div [class]="'flex items-center justify-center w-10 h-10 rounded-lg ' + section.color">
                  <i [class]="'pi ' + section.icon + ' text-white'"></i>
                </div>
                <div>
                  <h3 class="text-base font-semibold text-surface-900 dark:text-surface-0">{{ section.title }}</h3>
                  <p class="text-xs text-surface-400">{{ section.description }}</p>
                </div>
              </div>
              <p-button icon="pi pi-angle-right" [text]="true" severity="secondary" />
            </div>
          </div>
        }
      </div>

      <p class="text-center text-xs text-surface-400"><i class="pi pi-info-circle mr-1"></i>Tính năng đang được phát triển</p>
    </div>
  `,
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
