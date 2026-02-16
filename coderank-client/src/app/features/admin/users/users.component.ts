import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Tag } from 'primeng/tag';

interface UserPlaceholder {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  joinedAt: string;
}

@Component({
  selector: 'app-admin-users',
  imports: [FormsModule, InputText, Select, Button, IconField, InputIcon, Tag],
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">Quản lý người dùng</h1>
          <p class="mt-1 text-surface-500 dark:text-surface-400">Quản lý tài khoản và phân quyền người dùng</p>
        </div>
        <p-button label="Thêm người dùng" icon="pi pi-plus" severity="primary" />
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
        @for (s of userStats; track s.label) {
          <div class="flex items-center gap-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-800 p-4">
            <div [class]="'flex items-center justify-center w-10 h-10 rounded-lg ' + s.color">
              <i [class]="'pi ' + s.icon + ' text-white'"></i>
            </div>
            <div>
              <p class="text-xl font-bold text-surface-900 dark:text-surface-0">{{ s.value }}</p>
              <p class="text-xs text-surface-400">{{ s.label }}</p>
            </div>
          </div>
        }
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1">
          <p-iconfield iconPosition="left">
            <p-inputicon styleClass="pi pi-search" />
            <input type="text" pInputText placeholder="Tìm theo tên, email..." class="w-full" [(ngModel)]="searchTerm" />
          </p-iconfield>
        </div>
        <p-select
          [options]="roleOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Tất cả vai trò"
          [showClear]="true"
          styleClass="w-full sm:w-44"
        />
        <p-select
          [options]="statusOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Trạng thái"
          [showClear]="true"
          styleClass="w-full sm:w-40"
        />
      </div>

      <!-- User Table -->
      <div class="rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-800 overflow-hidden">
        <table class="w-full text-sm" aria-label="Users table">
          <thead>
            <tr class="border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900">
              <th class="text-left px-4 py-3 font-medium text-surface-600 dark:text-surface-300">Người dùng</th>
              <th class="text-left px-4 py-3 font-medium text-surface-600 dark:text-surface-300 hidden md:table-cell">Email</th>
              <th class="text-left px-4 py-3 font-medium text-surface-600 dark:text-surface-300 hidden sm:table-cell">Vai trò</th>
              <th class="text-left px-4 py-3 font-medium text-surface-600 dark:text-surface-300 hidden lg:table-cell">Trạng thái</th>
              <th class="text-left px-4 py-3 font-medium text-surface-600 dark:text-surface-300 hidden lg:table-cell">Ngày tham gia</th>
              <th class="px-4 py-3 w-20">
                <span class="sr-only">Hành động</span>
              </th>
            </tr>
          </thead>
          <tbody>
            @for (user of placeholderUsers; track user.id) {
              <tr class="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-900 transition-colors">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                      {{ user.name.charAt(0) }}
                    </div>
                    <span class="font-medium text-surface-800 dark:text-surface-100">{{ user.name }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-surface-500 hidden md:table-cell">{{ user.email }}</td>
                <td class="px-4 py-3 hidden sm:table-cell">
                  <p-tag [value]="user.role" [severity]="user.role === 'Admin' ? 'danger' : user.role === 'Lecturer' ? 'warn' : 'info'" />
                </td>
                <td class="px-4 py-3 hidden lg:table-cell">
                  <span [class]="'inline-flex items-center gap-1.5 text-xs ' + (user.status === 'active' ? 'text-green-600' : 'text-surface-400')">
                    <span [class]="'w-1.5 h-1.5 rounded-full ' + (user.status === 'active' ? 'bg-green-500' : 'bg-surface-300')"></span>
                    {{ user.status === 'active' ? 'Hoạt động' : 'Không hoạt động' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-surface-400 text-xs hidden lg:table-cell">{{ user.joinedAt }}</td>
                <td class="px-4 py-3">
                  <p-button icon="pi pi-ellipsis-v" [text]="true" [rounded]="true" severity="secondary" />
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Hint -->
      <p class="text-center text-xs text-surface-400">
        <i class="pi pi-info-circle mr-1"></i>
        Dữ liệu mẫu — Tính năng đầy đủ sẽ sớm được cập nhật
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsersComponent {
  readonly searchTerm = signal('');

  readonly userStats = [
    { label: 'Tổng người dùng', value: '—', icon: 'pi-users', color: 'bg-blue-500' },
    { label: 'Đang hoạt động', value: '—', icon: 'pi-check-circle', color: 'bg-green-500' },
    { label: 'Giảng viên', value: '—', icon: 'pi-user-edit', color: 'bg-amber-500' },
    { label: 'Sinh viên', value: '—', icon: 'pi-graduation-cap', color: 'bg-violet-500' },
  ];

  readonly roleOptions = [
    { label: 'Admin', value: 'admin' },
    { label: 'Giảng viên', value: 'instructor' },
    { label: 'Sinh viên', value: 'student' },
  ];

  readonly statusOptions = [
    { label: 'Hoạt động', value: 'active' },
    { label: 'Không hoạt động', value: 'inactive' },
  ];

  readonly placeholderUsers: UserPlaceholder[] = [
    { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', role: 'Admin', status: 'active', joinedAt: '01/01/2025' },
    { id: 2, name: 'Trần Thị B', email: 'tranthib@example.com', role: 'Lecturer', status: 'active', joinedAt: '15/02/2025' },
    { id: 3, name: 'Lê Văn C', email: 'levanc@example.com', role: 'Student', status: 'active', joinedAt: '20/03/2025' },
    { id: 4, name: 'Phạm Thị D', email: 'phamthid@example.com', role: 'Student', status: 'inactive', joinedAt: '05/04/2025' },
    { id: 5, name: 'Hoàng Văn E', email: 'hoangvane@example.com', role: 'Lecturer', status: 'active', joinedAt: '10/05/2025' },
  ];
}
