import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-admin-courses',
  imports: [Button, Tag],
  templateUrl: './courses.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCoursesComponent {
  readonly stats = [
    { label: 'Tổng khóa học', value: '—', icon: 'pi-book', color: 'bg-indigo-500' },
    { label: 'Đang hoạt động', value: '—', icon: 'pi-check-circle', color: 'bg-green-500' },
    { label: 'Tổng sinh viên', value: '—', icon: 'pi-users', color: 'bg-blue-500' },
  ];

  readonly courses = [
    { title: 'Cấu trúc dữ liệu & Giải thuật', status: 'Đang mở', instructor: 'GV. Nguyễn Văn A', students: 45, lessons: 12, color: 'bg-blue-500' },
    { title: 'Lập trình hướng đối tượng', status: 'Đang mở', instructor: 'GV. Trần Thị B', students: 38, lessons: 10, color: 'bg-emerald-500' },
    { title: 'Nhập môn lập trình', status: 'Đã kết thúc', instructor: 'GV. Lê Văn C', students: 60, lessons: 15, color: 'bg-amber-500' },
  ];
}
