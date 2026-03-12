import { Component, ChangeDetectionStrategy, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Paginator } from 'primeng/paginator';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Toast } from 'primeng/toast';
import { Tooltip } from 'primeng/tooltip';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

// Models & Enums
import { CoursesModel } from '../../../../data/models/courses.model';
import { CourseLevelEnum, CourseStatusEnum } from '../../../../data/enums/enums';

// Services
import { CoursesService } from '../services/courses.service';

// Components
import { AdminCourseFormDialogComponent } from '../components/course-form-dialog/course-form-dialog.component';
import { AdminCourseDuplicateDialogComponent, DuplicateCourseEvent } from '../components/course-duplicate-dialog/course-duplicate-dialog.component';

@Component({
  selector: 'app-admin-course-list',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    Button,
    InputText,
    Select,
    Paginator,
    IconField,
    InputIcon,
    Toast,
    Tooltip,
    ConfirmDialog,
    AdminCourseFormDialogComponent,
    AdminCourseDuplicateDialogComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './course-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCourseListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly coursesService = inject(CoursesService);
  private readonly messageService = inject(MessageService);
  private readonly confirmService = inject(ConfirmationService);

  // State
  readonly courses = signal<CoursesModel[]>([]);
  readonly loading = signal<boolean>(false);
  readonly totalRecords = signal<number>(0);

  // Dialog
  readonly showCourseDialog = signal<boolean>(false);
  readonly editingCourse = signal<CoursesModel | null>(null);
  readonly isSubmittingDialog = signal<boolean>(false);

  // Duplicate Dialog
  readonly showDuplicateDialog = signal<boolean>(false);
  readonly isDuplicating = signal<boolean>(false);

  // Filters
  readonly searchTerm = signal<string>('');
  readonly selectedLevel = signal<CourseLevelEnum | null>(null);
  readonly selectedStatus = signal<CourseStatusEnum | null>(null);
  readonly myCoursesOnly = signal<boolean>(false);
  readonly page = signal<number>(1);
  readonly limit = signal<number>(12);

  // Options
  readonly levelOptions = [
    { label: 'Cơ bản', value: CourseLevelEnum.Beginner },
    { label: 'Trung cấp', value: CourseLevelEnum.Intermediate },
    { label: 'Nâng cao', value: CourseLevelEnum.Advanced },
  ];

  readonly statusOptions = [
    { label: 'Nháp', value: CourseStatusEnum.Draft },
    { label: 'Xuất bản', value: CourseStatusEnum.Published },
    { label: 'Lưu trữ', value: CourseStatusEnum.Archived },
  ];

  readonly hasFilters = computed(() =>
    !!this.searchTerm() || !!this.selectedLevel() || !!this.selectedStatus() || this.myCoursesOnly()
  );

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading.set(true);
    const params: any = {
      page: this.page(),
      limit: this.limit(),
    };

    if (this.searchTerm()) params.search = this.searchTerm();
    if (this.selectedLevel()) params.level = this.selectedLevel();
    if (this.selectedStatus()) params.status = this.selectedStatus();

    const obs = this.myCoursesOnly()
      ? this.coursesService.getMyCourses(params)
      : this.coursesService.getCourses(params);

    obs.subscribe({
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

  onStatusChange(): void {
    this.page.set(1);
    this.loadCourses();
  }

  onMyCoursesToggle(value: boolean): void {
    this.myCoursesOnly.set(value);
    this.page.set(1);
    this.loadCourses();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedLevel.set(null);
    this.selectedStatus.set(null);
    this.myCoursesOnly.set(false);
    this.page.set(1);
    this.loadCourses();
  }

  viewCourse(course: CoursesModel): void {
    this.router.navigate([course.id], { relativeTo: this.route });
  }

  createCourse(): void {
    this.editingCourse.set(null);
    this.showCourseDialog.set(true);
  }

  editCourse(event: Event, course: CoursesModel): void {
    event.stopPropagation();
    this.loading.set(true);
    this.coursesService.getCourse(course.id.toString()).subscribe({
      next: (response) => {
        if (response.data) {
          this.editingCourse.set(response.data);
          this.showCourseDialog.set(true);
        }
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); },
    });
  }

  deleteCourse(event: Event, course: CoursesModel): void {
    event.stopPropagation();
    this.confirmService.confirm({
      message: `Bạn có chắc muốn xóa khóa học "${course.title}"?`,
      header: 'Xác nhận',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.coursesService.deleteCourse(course.id.toString()).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa khóa học' });
            this.loadCourses();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể xóa khóa học' });
          },
        });
      },
    });
  }

  onCourseSave(data: any): void {
    this.isSubmittingDialog.set(true);
    if (this.editingCourse()) {
      this.coursesService.updateCourse(this.editingCourse()!.id.toString(), data).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật khóa học' });
          this.showCourseDialog.set(false);
          this.isSubmittingDialog.set(false);
          this.loadCourses();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể cập nhật khóa học' });
          this.isSubmittingDialog.set(false);
        },
      });
    } else {
      this.coursesService.createCourse(data).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã tạo khóa học' });
          this.showCourseDialog.set(false);
          this.isSubmittingDialog.set(false);
          this.page.set(1);
          this.loadCourses();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tạo khóa học' });
          this.isSubmittingDialog.set(false);
        },
      });
    }
  }

  closeCourseDialog(): void {
    this.showCourseDialog.set(false);
    this.editingCourse.set(null);
  }

  // ===== DUPLICATE =====

  openDuplicateDialog(): void {
    this.showDuplicateDialog.set(true);
  }

  closeDuplicateDialog(): void {
    this.showDuplicateDialog.set(false);
  }

  onDuplicateCourse(event: DuplicateCourseEvent): void {
    this.isDuplicating.set(true);
    this.coursesService.duplicateCourse(event.sourceCourseId, {
      title: event.title,
      slug: event.slug,
    }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã nhân bản khóa học' });
        this.showDuplicateDialog.set(false);
        this.isDuplicating.set(false);
        this.page.set(1);
        this.loadCourses();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể nhân bản khóa học' });
        this.isDuplicating.set(false);
      },
    });
  }

  duplicateCourseFromCard(event: Event, course: CoursesModel): void {
    event.stopPropagation();
    this.showDuplicateDialog.set(true);
  }

  getLevelSeverity(level: CourseLevelEnum): 'success' | 'info' | 'warn' {
    switch (level) {
      case CourseLevelEnum.Beginner: return 'success';
      case CourseLevelEnum.Intermediate: return 'info';
      case CourseLevelEnum.Advanced: return 'warn';
      default: return 'info';
    }
  }

  getLevelLabel(level: CourseLevelEnum): string {
    const labels: Record<CourseLevelEnum, string> = {
      [CourseLevelEnum.Beginner]: 'Cơ bản',
      [CourseLevelEnum.Intermediate]: 'Trung cấp',
      [CourseLevelEnum.Advanced]: 'Nâng cao',
    };
    return labels[level] || level;
  }

  getStatusSeverity(status: CourseStatusEnum): 'success' | 'info' | 'secondary' {
    switch (status) {
      case CourseStatusEnum.Published: return 'success';
      case CourseStatusEnum.Draft: return 'info';
      case CourseStatusEnum.Archived: return 'secondary';
      default: return 'info';
    }
  }

  getStatusLabel(status: CourseStatusEnum): string {
    const labels: Record<CourseStatusEnum, string> = {
      [CourseStatusEnum.Draft]: 'Nháp',
      [CourseStatusEnum.Published]: 'Xuất bản',
      [CourseStatusEnum.Archived]: 'Lưu trữ',
    };
    return labels[status] || status;
  }
}
