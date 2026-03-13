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
  templateUrl: './logs.component.html',
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
