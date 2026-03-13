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
  templateUrl: './users.component.html',
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
