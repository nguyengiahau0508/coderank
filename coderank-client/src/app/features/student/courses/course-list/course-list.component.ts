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
import { Button } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';

// Models & Enums
import { CoursesModel } from '../../../../data';
import { CourseLevelEnum, CourseStatusEnum } from '../../../../data';

// Services
import { StudentCoursesService } from '../services/courses.service';

interface SortOption {
  label: string;
  value: string;
  order: 'ASC' | 'DESC';
}

@Component({
  selector: 'app-student-course-list',
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
    Button,
    Skeleton,
  ],
  providers: [MessageService],
  templateUrl: './course-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentCourseListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly coursesService = inject(StudentCoursesService);
  private readonly messageService = inject(MessageService);

  // Sort options - defined first as it's used in signal initialization
  readonly sortOptions: SortOption[] = [
    { label: 'Mới nhất', value: 'createdAt', order: 'DESC' },
    { label: 'Phổ biến nhất', value: 'enrollmentCount', order: 'DESC' },
    { label: 'Đánh giá cao', value: 'averageRating', order: 'DESC' },
    { label: 'Tên A-Z', value: 'title', order: 'ASC' },
  ];

  // State
  readonly courses = signal<CoursesModel[]>([]);
  readonly loading = signal<boolean>(false);
  readonly totalRecords = signal<number>(0);

  // Stats
  readonly stats = signal<{
    total: number;
    beginner: number;
    intermediate: number;
    advanced: number;
  }>({ total: 0, beginner: 0, intermediate: 0, advanced: 0 });

  // Filters
  readonly searchTerm = signal<string>('');
  readonly selectedLevel = signal<CourseLevelEnum | null>(null);
  readonly selectedCategory = signal<string | null>(null);
  readonly selectedSort = signal<SortOption>(this.sortOptions[0]);
  readonly page = signal<number>(1);
  readonly limit = signal<number>(12);

  // Options
  readonly levelOptions = [
    { label: 'Cơ bản', value: CourseLevelEnum.Beginner },
    { label: 'Trung cấp', value: CourseLevelEnum.Intermediate },
    { label: 'Nâng cao', value: CourseLevelEnum.Advanced },
  ];

  readonly categoryOptions = signal<{ label: string; value: string }[]>([]);

  readonly hasFilters = computed(() =>
    !!this.searchTerm() || !!this.selectedLevel() || !!this.selectedCategory()
  );
  readonly activeFilterLabels = computed(() => {
    const labels: string[] = [];
    const search = this.searchTerm().trim();
    const level = this.selectedLevel();
    const category = this.selectedCategory();

    if (search) {
      labels.push(`Từ khóa: ${search}`);
    }
    if (level) {
      labels.push(`Cấp độ: ${this.getLevelLabel(level)}`);
    }
    if (category) {
      labels.push(`Danh mục: ${category}`);
    }

    return labels;
  });
  readonly displaySummary = computed(() => {
    const currentCount = this.courses().length;
    const total = this.totalRecords();
    if (!total) {
      return 'Chưa có khóa học phù hợp.';
    }

    const start = (this.page() - 1) * this.limit() + 1;
    const end = start + currentCount - 1;
    return `Hiển thị ${start}-${end} trên ${total} khóa học`;
  });

  ngOnInit(): void {
    this.loadStats();
    this.loadCourses();
    this.loadCategories();
  }

  loadStats(): void {
    // Load all published courses to calculate stats
    this.coursesService.getCourses({ limit: 1000, status: CourseStatusEnum.Published } as any).subscribe({
      next: (response) => {
        const courses = response.data || [];
        this.stats.set({
          total: courses.length,
          beginner: courses.filter(c => c.level === CourseLevelEnum.Beginner).length,
          intermediate: courses.filter(c => c.level === CourseLevelEnum.Intermediate).length,
          advanced: courses.filter(c => c.level === CourseLevelEnum.Advanced).length,
        });
      },
    });
  }

  loadCategories(): void {
    // Load unique categories from courses
    this.coursesService.getCourses({ limit: 1000, status: CourseStatusEnum.Published } as any).subscribe({
      next: (response) => {
        const courses = response.data || [];
        const categories = [...new Set(courses.map(c => c.category).filter(Boolean))] as string[];
        this.categoryOptions.set(categories.map(c => ({ label: c, value: c })));
      },
    });
  }

  loadCourses(): void {
    this.loading.set(true);
    const sort = this.selectedSort();
    const params: any = {
      page: this.page(),
      limit: this.limit(),
      status: CourseStatusEnum.Published,
      sortBy: sort.value,
      sortOrder: sort.order,
    };

    if (this.searchTerm()) params.search = this.searchTerm();
    if (this.selectedLevel()) params.level = this.selectedLevel();
    if (this.selectedCategory()) params.category = this.selectedCategory();

    this.coursesService.getCourses(params).subscribe({
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

  onCategoryChange(): void {
    this.page.set(1);
    this.loadCourses();
  }

  onSortChange(): void {
    this.page.set(1);
    this.loadCourses();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedLevel.set(null);
    this.selectedCategory.set(null);
    this.page.set(1);
    this.loadCourses();
  }

  viewCourse(course: CoursesModel): void {
    this.router.navigate(['..', course.id], { relativeTo: this.route });
  }

  goToMyCourses(): void {
    this.router.navigate(['..', 'my-courses'], { relativeTo: this.route });
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
}
