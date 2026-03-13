import { Component, ChangeDetectionStrategy, input, output, signal, inject, OnInit, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Paginator } from 'primeng/paginator';

import { CoursesModel } from '../../../../../data';
import { CourseLevelEnum, CourseStatusEnum } from '../../../../../data';
import { CoursesService } from '../../../../../shared/services/courses/courses.service';

export interface DuplicateCourseEvent {
  sourceCourseId: string;
  title: string;
  slug: string;
}

@Component({
  selector: 'app-admin-course-duplicate-dialog',
  imports: [
    CommonModule,
    FormsModule,
    Dialog,
    Button,
    InputText,
    IconField,
    InputIcon,
    ProgressSpinner,
    Paginator,
  ],
  templateUrl: './course-duplicate-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCourseDuplicateDialogComponent {
  private readonly coursesService = inject(CoursesService);

  // Inputs
  readonly visible = input<boolean>(false);
  readonly submitting = input<boolean>(false);

  // Outputs
  readonly visibleChange = output<boolean>();
  readonly duplicate = output<DuplicateCourseEvent>();

  // State
  readonly step = signal<'select' | 'confirm'>('select');
  readonly myCourses = signal<CoursesModel[]>([]);
  readonly loadingCourses = signal<boolean>(false);
  readonly selectedCourse = signal<CoursesModel | null>(null);
  readonly totalCourses = signal<number>(0);
  readonly coursesPage = signal<number>(1);
  readonly coursesLimit = signal<number>(10);

  // Search
  searchTerm = '';

  // New course form
  newTitle = '';
  newSlug = '';

  constructor() {
    // Load courses when dialog opens
    effect(() => {
      if (this.visible()) {
        this.reset();
        this.loadMyCourses();
      }
    });
  }

  loadMyCourses(): void {
    this.loadingCourses.set(true);
    const params: any = {
      page: this.coursesPage(),
      limit: this.coursesLimit(),
    };
    if (this.searchTerm.trim()) {
      params.search = this.searchTerm.trim();
    }

    this.coursesService.getMyCourses(params).subscribe({
      next: (response) => {
        this.myCourses.set(response.data || []);
        this.totalCourses.set(response.meta?.totalItems ?? 0);
        this.loadingCourses.set(false);
      },
      error: () => {
        this.loadingCourses.set(false);
      },
    });
  }

  searchCourses(): void {
    this.coursesPage.set(1);
    this.loadMyCourses();
  }

  onPageChange(event: any): void {
    this.coursesPage.set(event.page + 1);
    this.coursesLimit.set(event.rows);
    this.loadMyCourses();
  }

  selectCourse(course: CoursesModel): void {
    this.selectedCourse.set(course);
  }

  goToConfirm(): void {
    if (!this.selectedCourse()) return;
    const source = this.selectedCourse()!;
    this.newTitle = `${source.title} (Bản sao)`;
    this.newSlug = `${source.slug}-ban-sao`;
    this.step.set('confirm');
  }

  goBackToSelect(): void {
    this.step.set('select');
  }

  autoGenerateSlug(): void {
    this.newSlug = this.toSlug(this.newTitle);
  }

  isValid(): boolean {
    return !!this.newTitle.trim() && !!this.newSlug.trim();
  }

  onDuplicate(): void {
    if (!this.selectedCourse() || !this.isValid()) return;
    this.duplicate.emit({
      sourceCourseId: this.selectedCourse()!.id.toString(),
      title: this.newTitle.trim(),
      slug: this.newSlug.trim(),
    });
  }

  onCancel(): void {
    this.visibleChange.emit(false);
  }

  onVisibleChange(visible: boolean): void {
    this.visibleChange.emit(visible);
  }

  // Helpers
  getLevelLabel(level: CourseLevelEnum): string {
    const labels: Record<CourseLevelEnum, string> = {
      [CourseLevelEnum.Beginner]: 'Cơ bản',
      [CourseLevelEnum.Intermediate]: 'Trung cấp',
      [CourseLevelEnum.Advanced]: 'Nâng cao',
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

  getStatusLabel(status: CourseStatusEnum): string {
    const labels: Record<CourseStatusEnum, string> = {
      [CourseStatusEnum.Draft]: 'Nháp',
      [CourseStatusEnum.Published]: 'Xuất bản',
      [CourseStatusEnum.Archived]: 'Lưu trữ',
    };
    return labels[status] || status;
  }

  private reset(): void {
    this.step.set('select');
    this.selectedCourse.set(null);
    this.searchTerm = '';
    this.newTitle = '';
    this.newSlug = '';
    this.coursesPage.set(1);
  }

  private toSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
