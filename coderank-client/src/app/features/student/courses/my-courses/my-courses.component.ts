import { Component, ChangeDetectionStrategy, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Tag } from 'primeng/tag';
import { Paginator } from 'primeng/paginator';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Toast } from 'primeng/toast';
import { Tooltip } from 'primeng/tooltip';
import { Button } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';

// Models & Enums
import { CoursesModel } from '../../../../data';
import { CourseLevelEnum, EnrollmentStatusEnum } from '../../../../data';

// Services
import { StudentCoursesService } from '../services/courses.service';

interface TabOption {
  label: string;
  value: EnrollmentStatusEnum | 'all';
  icon: string;
}

@Component({
  selector: 'app-student-my-courses',
  imports: [
    CommonModule,
    FormsModule,
    InputText,
    Select,
    Tag,
    Paginator,
    IconField,
    InputIcon,
    Toast,
    Tooltip,
    Button,
    Skeleton,
  ],
  providers: [MessageService],
  templateUrl: './my-courses.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentMyCoursesComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly coursesService = inject(StudentCoursesService);
  private readonly messageService = inject(MessageService);

  // State
  readonly courses = signal<CoursesModel[]>([]);
  readonly loading = signal<boolean>(false);
  readonly totalRecords = signal<number>(0);

  // Stats
  readonly stats = signal<{
    total: number;
    inProgress: number;
    completed: number;
  }>({ total: 0, inProgress: 0, completed: 0 });

  // Filters
  readonly searchTerm = signal<string>('');
  readonly activeTab = signal<EnrollmentStatusEnum | 'all'>('all');
  readonly selectedLevel = signal<CourseLevelEnum | null>(null);
  readonly page = signal<number>(1);
  readonly limit = signal<number>(12);

  // Options
  readonly tabOptions: TabOption[] = [
    { label: 'Tất cả', value: 'all', icon: 'pi-list' },
    { label: 'Đang học', value: EnrollmentStatusEnum.Active, icon: 'pi-play-circle' },
    { label: 'Hoàn thành', value: EnrollmentStatusEnum.Completed, icon: 'pi-check-circle' },
  ];

  readonly levelOptions = [
    { label: 'Cơ bản', value: CourseLevelEnum.Beginner },
    { label: 'Trung cấp', value: CourseLevelEnum.Intermediate },
    { label: 'Nâng cao', value: CourseLevelEnum.Advanced },
  ];

  readonly hasFilters = computed(() =>
    !!this.searchTerm() || !!this.selectedLevel()
  );

  ngOnInit(): void {
    this.loadStats();
    this.loadCourses();
  }

  loadStats(): void {
    // Load all enrolled courses to calculate stats
    this.coursesService.getEnrolledCourses({ limit: 1000 } as any).subscribe({
      next: (response) => {
        const courses = response.data || [];
        const inProgress = courses.filter(c => c.enrollment?.status === EnrollmentStatusEnum.Active).length;
        const completed = courses.filter(c => c.enrollment?.status === EnrollmentStatusEnum.Completed).length;
        this.stats.set({
          total: courses.length,
          inProgress,
          completed,
        });
      },
    });
  }

  loadCourses(): void {
    this.loading.set(true);
    const params: any = {
      page: this.page(),
      limit: this.limit(),
      sortBy: 'lastAccessedAt',
      sortOrder: 'DESC',
    };

    if (this.searchTerm()) params.search = this.searchTerm();
    if (this.selectedLevel()) params.level = this.selectedLevel();

    // Set status filter based on active tab
    const tab = this.activeTab();
    if (tab !== 'all') {
      params.status = tab;
    }

    this.coursesService.getEnrolledCourses(params).subscribe({
      next: (response) => {
        this.courses.set(response.data || []);
        this.totalRecords.set(response.meta?.totalItems ?? 0);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể tải danh sách khóa học',
        });
      },
    });
  }

  onTabChange(tab: EnrollmentStatusEnum | 'all'): void {
    this.activeTab.set(tab);
    this.page.set(1);
    this.loadCourses();
  }

  onPageChange(event: any): void {
    this.page.set(event.page + 1);
    this.limit.set(event.rows);
    this.loadCourses();
  }

  onSearch(): void {
    this.page.set(1);
    this.loadCourses();
  }

  onLevelChange(): void {
    this.page.set(1);
    this.loadCourses();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedLevel.set(null);
    this.page.set(1);
    this.loadCourses();
  }

  viewCourse(course: CoursesModel): void {
    this.router.navigate(['..', course.id], { relativeTo: this.route });
  }

  continueCourse(event: Event, course: CoursesModel): void {
    event.stopPropagation();
    this.router.navigate(['..', course.id], { relativeTo: this.route });
  }

  exploreCourses(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  // ==================== HELPERS ====================

  getLevelLabel(level: CourseLevelEnum): string {
    const labels: Record<string, string> = {
      beginner: 'Cơ bản',
      intermediate: 'Trung cấp',
      advanced: 'Nâng cao',
    };
    return labels[level] || level;
  }

  getLevelSeverity(level: CourseLevelEnum): 'success' | 'info' | 'warn' {
    switch (level) {
      case CourseLevelEnum.Beginner:
        return 'success';
      case CourseLevelEnum.Intermediate:
        return 'info';
      case CourseLevelEnum.Advanced:
        return 'warn';
      default:
        return 'info';
    }
  }

  getLevelColor(level: CourseLevelEnum): string {
    switch (level) {
      case CourseLevelEnum.Beginner:
        return 'bg-green-500';
      case CourseLevelEnum.Intermediate:
        return 'bg-blue-500';
      case CourseLevelEnum.Advanced:
        return 'bg-orange-500';
      default:
        return 'bg-surface-400';
    }
  }

  getProgressColor(percent: number): string {
    if (percent >= 100) return 'bg-green-500';
    if (percent >= 50) return 'bg-blue-500';
    return 'bg-primary';
  }

  formatDate(date: Date | string | null): string {
    if (!date) return '—';
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}
