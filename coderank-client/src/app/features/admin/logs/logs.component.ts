import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-admin-logs',
  imports: [FormsModule, InputText, Select, Button, IconField, InputIcon, Tag],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">Nhật ký hệ thống</h1>
          <p class="mt-1 text-surface-500 dark:text-surface-400">Theo dõi hoạt động và sự kiện của hệ thống</p>
        </div>
        <p-button label="Xuất logs" icon="pi pi-download" severity="secondary" [outlined]="true" />
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1">
          <p-iconfield iconPosition="left">
            <p-inputicon styleClass="pi pi-search" />
            <input type="text" pInputText placeholder="Tìm trong logs..." class="w-full" [(ngModel)]="searchTerm" />
          </p-iconfield>
        </div>
        <p-select
          [options]="levelOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Mức độ"
          [showClear]="true"
          styleClass="w-full sm:w-36"
        />
        <p-select
          [options]="sourceOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Nguồn"
          [showClear]="true"
          styleClass="w-full sm:w-40"
        />
      </div>

      <!-- Log Entries -->
      <div class="rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-800 divide-y divide-surface-100 dark:divide-surface-800">
        @for (log of logs; track log.time) {
          <div class="px-5 py-3 flex items-start gap-3 hover:bg-surface-50 dark:hover:bg-surface-900 transition-colors">
            <p-tag
              [value]="log.level"
              [severity]="log.level === 'ERROR' ? 'danger' : log.level === 'WARN' ? 'warn' : log.level === 'INFO' ? 'info' : 'secondary'"
              styleClass="text-[10px] min-w-14 text-center"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm text-surface-700 dark:text-surface-300 font-mono">{{ log.message }}</p>
              <div class="flex gap-3 mt-1 text-xs text-surface-400">
                <span>{{ log.time }}</span>
                <span>{{ log.source }}</span>
              </div>
            </div>
          </div>
        }
      </div>

      <p class="text-center text-xs text-surface-400"><i class="pi pi-info-circle mr-1"></i>Dữ liệu mẫu — Tính năng đầy đủ sẽ sớm được cập nhật</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLogsComponent {
  readonly searchTerm = signal('');

  readonly levelOptions = [
    { label: 'Info', value: 'info' },
    { label: 'Warning', value: 'warn' },
    { label: 'Error', value: 'error' },
  ];

  readonly sourceOptions = [
    { label: 'API Server', value: 'api' },
    { label: 'Judge Server', value: 'judge' },
    { label: 'Auth', value: 'auth' },
  ];

  readonly logs = [
    { level: 'INFO', message: 'Application started successfully', time: '16/02/2026 08:00:01', source: 'API Server' },
    { level: 'INFO', message: 'User nguyenvana@example.com logged in', time: '16/02/2026 08:15:22', source: 'Auth' },
    { level: 'WARN', message: 'Judge queue reaching capacity (85%)', time: '16/02/2026 09:30:45', source: 'Judge Server' },
    { level: 'ERROR', message: 'Failed to compile submission #1234: timeout exceeded', time: '16/02/2026 09:31:02', source: 'Judge Server' },
    { level: 'INFO', message: 'Problem "Two Sum" updated by admin', time: '16/02/2026 10:00:15', source: 'API Server' },
    { level: 'INFO', message: 'Database backup completed (2.3 GB)', time: '16/02/2026 12:00:00', source: 'API Server' },
  ];
}
