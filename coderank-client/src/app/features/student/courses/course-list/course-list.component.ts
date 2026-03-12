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
import { MessageService } from 'primeng/api';

// Models & Enums
import { CoursesModel } from '../../../../data';
import { CourseLevelEnum, CourseStatusEnum } from '../../../../data';

// Services
import { StudentCoursesService } from '../services/courses.service';

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
    Tooltip,
    Button,
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

  // State
  readonly courses = signal<CoursesModel[]>([]);
  readonly loading = signal<boolean>(false);
  readonly totalRecords = signal<number>(0);

  // Filters
  readonly searchTerm = signal<string>('');
  readonly selectedLevel = signal<CourseLevelEnum | null>(null);
  readonly selectedCategory = signal<string | null>(null);
  readonly page = signal<number>(1);
  readonly limit = signal<number>(12);

  // Options
  readonly levelOptions = [
    { label: 'Cơ bản', value: CourseLevelEnum.Beginner },
    { label: 'Trung cấp', value: CourseLevelEnum.Intermediate },
    { label: 'Nâng cao', value: CourseLevelEnum.Advanced },
  ];

  readonly hasFilters = computed(() =>
    !!this.searchTerm() || !!this.selectedLevel() || !!this.selectedCategory()
  );

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading.set(true);
    const params: any = {
      page: this.page(),
      limit: this.limit(),
      status: CourseStatusEnum.Published,
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

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedLevel.set(null);
    this.selectedCategory.set(null);
    this.page.set(1);
    this.loadCourses();
  }

  viewCourse(course: CoursesModel): void {
    this.router.navigate([course.id], { relativeTo: this.route });
  }

  // ==================== HELPERS ====================

  getLevelLabel(level: CourseLevelEnum): string {
    const labels: Record<string, string> = {
      beginner: 'Cơ bản', intermediate: 'Trung cấp', advanced: 'Nâng cao',
    };
    return labels[level] || level;
  }

  getLevelSeverity(level: CourseLevelEnum): 'success' | 'info' | 'warn' {
    switch (level) {
      case CourseLevelEnum.Beginner: return 'success';
      case CourseLevelEnum.Intermediate: return 'info';
      case CourseLevelEnum.Advanced: return 'warn';
      default: return 'info';
    }
  }

  getLevelColor(level: CourseLevelEnum): string {
    switch (level) {
      case CourseLevelEnum.Beginner: return 'bg-green-500';
      case CourseLevelEnum.Intermediate: return 'bg-blue-500';
      case CourseLevelEnum.Advanced: return 'bg-orange-500';
      default: return 'bg-surface-400';
    }
  }
}
