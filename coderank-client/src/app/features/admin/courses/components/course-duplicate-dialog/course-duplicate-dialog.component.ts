import { Component, ChangeDetectionStrategy, input, output, signal, inject, OnInit, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Tooltip } from 'primeng/tooltip';
import { Paginator } from 'primeng/paginator';

import { CoursesModel } from '../../../../../data/models/courses.model';
import { CourseLevelEnum, CourseStatusEnum } from '../../../../../data/enums/enums';
import { CoursesService } from '../../services/courses.service';

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
  template: `
    <p-dialog
      [header]="step() === 'select' ? 'Nhân bản khóa học' : 'Xác nhận nhân bản'"
      [visible]="visible()"
      (visibleChange)="onVisibleChange($event)"
      [modal]="true"
      [style]="{ width: '720px', maxHeight: '90vh' }"
      [closable]="!submitting()"
      [contentStyle]="{ overflow: 'auto' }"
    >
      <!-- Step 1: Select source course -->
      @if (step() === 'select') {
        <div class="space-y-4 pt-2">
          <p class="text-sm" style="color: var(--cr-text-muted);">
            Chọn một khóa học của bạn để nhân bản. Tất cả nội dung (chương, bài học, bài tập, bài kiểm tra, ...) sẽ được sao chép.
            Sinh viên và bài làm sẽ <strong>không</strong> được sao chép.
          </p>

          <!-- Search -->
          <p-iconfield iconPosition="left">
            <p-inputicon styleClass="pi pi-search" />
            <input
              type="text"
              pInputText
              placeholder="Tìm khóa học của bạn..."
              [(ngModel)]="searchTerm"
              (keyup.enter)="searchCourses()"
              class="w-full"
            />
          </p-iconfield>

          <!-- Loading -->
          @if (loadingCourses()) {
            <div class="flex items-center justify-center py-8">
              <p-progressSpinner [style]="{ width: '40px', height: '40px' }" strokeWidth="4" />
            </div>
          } @else if (myCourses().length === 0) {
            <div class="flex flex-col items-center justify-center py-8" style="color: var(--cr-text-subtle);">
              <i class="pi pi-inbox text-3xl mb-2"></i>
              <p class="text-sm">Không tìm thấy khóa học nào</p>
            </div>
          } @else {
            <!-- Course list -->
            <div class="space-y-2 max-h-96 overflow-y-auto">
              @for (course of myCourses(); track course.id) {
                <div
                  class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all"
                  [style]="selectedCourse()?.id === course.id
                    ? 'background: rgba(88, 166, 255, 0.08); border: 1px solid var(--cr-accent-blue); box-shadow: 0 0 0 1px var(--cr-accent-blue);'
                    : 'background: var(--cr-bg-secondary); border: 1px solid var(--cr-border);'"
                  (click)="selectCourse(course)"
                >
                  <!-- Color indicator -->
                  <div
                    class="w-1 h-10 rounded-full shrink-0"
                    [style.background]="course.level === 'beginner' ? 'var(--cr-accent-green)' : course.level === 'intermediate' ? 'var(--cr-accent-blue)' : 'var(--cr-syntax-variable)'"
                  ></div>

                  <!-- Course info -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <h4 class="text-sm font-semibold truncate" style="color: var(--cr-text-primary);">{{ course.title }}</h4>
                      <span
                        class="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        [style]="course.level === 'beginner'
                          ? 'background: rgba(63, 185, 80, 0.12); color: var(--cr-accent-green);'
                          : course.level === 'intermediate'
                            ? 'background: rgba(88, 166, 255, 0.12); color: var(--cr-accent-blue);'
                            : 'background: rgba(255, 166, 87, 0.12); color: var(--cr-syntax-variable);'"
                      >{{ getLevelLabel(course.level) }}</span>
                    </div>
                    <div class="flex items-center gap-3 text-xs mt-0.5" style="color: var(--cr-text-subtle);">
                      <span><i class="pi pi-users mr-1"></i>{{ course.enrollmentCount }} SV</span>
                      <span><i class="pi pi-book mr-1"></i>{{ getStatusLabel(course.status) }}</span>
                      @if (course.category) {
                        <span>{{ course.category }}</span>
                      }
                    </div>
                  </div>

                  <!-- Selected indicator -->
                  @if (selectedCourse()?.id === course.id) {
                    <i class="pi pi-check-circle text-lg shrink-0" style="color: var(--cr-accent-blue);"></i>
                  }
                </div>
              }
            </div>

            <!-- Paginator -->
            @if (totalCourses() > coursesLimit()) {
              <p-paginator
                [rows]="coursesLimit()"
                [totalRecords]="totalCourses()"
                [rowsPerPageOptions]="[10, 20]"
                (onPageChange)="onPageChange($event)"
              />
            }
          }
        </div>

        <ng-template #footer>
          <div class="flex justify-end gap-2 pt-2">
            <p-button label="Hủy" severity="secondary" [text]="true" (onClick)="onCancel()" />
            <p-button label="Tiếp tục" icon="pi pi-arrow-right" (onClick)="goToConfirm()" [disabled]="!selectedCourse()" />
          </div>
        </ng-template>
      }

      <!-- Step 2: Configure & confirm -->
      @if (step() === 'confirm') {
        <div class="space-y-5 pt-2">
          <!-- Source course info -->
          <div class="rounded-lg p-4" style="background: var(--cr-bg-tertiary); border: 1px solid var(--cr-border);">
            <p class="text-xs mb-1" style="color: var(--cr-text-subtle);">Nhân bản từ</p>
            <div class="flex items-center gap-2">
              <h4 class="text-sm font-semibold" style="color: var(--cr-text-primary);">{{ selectedCourse()!.title }}</h4>
              <span
                class="text-[10px] font-medium px-2 py-0.5 rounded-full"
                [style]="selectedCourse()!.level === 'beginner'
                  ? 'background: rgba(63, 185, 80, 0.12); color: var(--cr-accent-green);'
                  : selectedCourse()!.level === 'intermediate'
                    ? 'background: rgba(88, 166, 255, 0.12); color: var(--cr-accent-blue);'
                    : 'background: rgba(255, 166, 87, 0.12); color: var(--cr-syntax-variable);'"
              >{{ getLevelLabel(selectedCourse()!.level) }}</span>
            </div>
            @if (selectedCourse()!.summary) {
              <div class="text-xs mt-1 line-clamp-2 ql-editor p-0" style="color: var(--cr-text-muted);" [innerHTML]="selectedCourse()!.summary"></div>
            }
          </div>

          <div class="flex items-center gap-2 text-xs" style="color: var(--cr-text-muted);">
            <i class="pi pi-info-circle"></i>
            <span>Nội dung sẽ được sao chép: chương, bài học, bài tập, bài kiểm tra, câu hỏi. Sinh viên và bài làm sẽ không được sao chép.</span>
          </div>

          <!-- New course title -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium" style="color: var(--cr-text-muted);">
              Tiêu đề khóa học mới <span style="color: var(--cr-accent-red);">*</span>
            </label>
            <input
              pInputText
              [(ngModel)]="newTitle"
              class="w-full"
              placeholder="Nhập tiêu đề cho khóa học mới"
              (ngModelChange)="autoGenerateSlug()"
            />
          </div>

          <!-- New slug -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium" style="color: var(--cr-text-muted);">
              Slug <span style="color: var(--cr-accent-red);">*</span>
            </label>
            <input
              pInputText
              [(ngModel)]="newSlug"
              class="w-full"
              placeholder="slug-tu-dong-tu-tieu-de"
            />
          </div>
        </div>

        <ng-template #footer>
          <div class="flex justify-between pt-2">
            <p-button label="Quay lại" icon="pi pi-arrow-left" severity="secondary" [text]="true" (onClick)="goBackToSelect()" [disabled]="submitting()" />
            <div class="flex gap-2">
              <p-button label="Hủy" severity="secondary" [text]="true" (onClick)="onCancel()" [disabled]="submitting()" />
              <p-button
                label="Nhân bản"
                icon="pi pi-copy"
                (onClick)="onDuplicate()"
                [loading]="submitting()"
                [disabled]="!isValid()"
              />
            </div>
          </div>
        </ng-template>
      }
    </p-dialog>
  `,
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
