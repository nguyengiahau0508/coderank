import { Component, ChangeDetectionStrategy, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { InputNumber } from 'primeng/inputnumber';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { TextEditorComponent } from '../../../../../shared/components/text-editor/text-editor.component';
import { CoursesModel } from '../../../../../data';
import { CourseLevelEnum, CourseStatusEnum } from '../../../../../data';

@Component({
  selector: 'app-admin-course-form-dialog',
  imports: [
    CommonModule,
    FormsModule,
    Dialog,
    Button,
    InputText,
    Select,
    InputNumber,
    ToggleSwitch,
    TextEditorComponent,
  ],
  template: `
    <p-dialog
      [header]="editing() ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'"
      [visible]="visible()"
      (visibleChange)="onVisibleChange($event)"
      [modal]="true"
      [style]="{ width: '780px', maxHeight: '90vh' }"
      [closable]="!submitting()"
      [contentStyle]="{ overflow: 'auto' }"
    >
      <div class="space-y-5 pt-2">
        <!-- ===== BASIC INFO ===== -->
        <fieldset class="space-y-4">
          <legend class="text-sm font-semibold mb-1" style="color: var(--cr-text-primary);">Thông tin cơ bản</legend>

          <!-- Title -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium" style="color: var(--cr-text-muted);">Tiêu đề <span style="color: var(--cr-accent-red);">*</span></label>
            <input pInputText [(ngModel)]="form.title" class="w-full" placeholder="Nhập tiêu đề khóa học" (ngModelChange)="autoGenerateSlug()" />
          </div>

          <!-- Slug -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium" style="color: var(--cr-text-muted);">Slug <span style="color: var(--cr-accent-red);">*</span></label>
            <input pInputText [(ngModel)]="form.slug" class="w-full" placeholder="tu-dong-tao-tu-tieu-de" />
          </div>

          <!-- Row: Level + Status + Category -->
          <div class="grid grid-cols-3 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium" style="color: var(--cr-text-muted);">Cấp độ</label>
              <p-select [(ngModel)]="form.level" [options]="levelOptions" optionLabel="label" optionValue="value" placeholder="Chọn" styleClass="w-full" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium" style="color: var(--cr-text-muted);">Trạng thái</label>
              <p-select [(ngModel)]="form.status" [options]="statusOptions" optionLabel="label" optionValue="value" placeholder="Chọn" styleClass="w-full" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium" style="color: var(--cr-text-muted);">Danh mục</label>
              <input pInputText [(ngModel)]="form.category" class="w-full" placeholder="vd: Data Structures" />
            </div>
          </div>
        </fieldset>

        <!-- ===== DESCRIPTION ===== -->
        <fieldset class="space-y-4">
          <legend class="text-sm font-semibold mb-1" style="color: var(--cr-text-primary);">Nội dung mô tả</legend>

          <!-- Summary -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium" style="color: var(--cr-text-muted);">Tóm tắt</label>
            <app-text-editor [(ngModel)]="form.summary" />
          </div>

          <!-- Description -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium" style="color: var(--cr-text-muted);">Mô tả chi tiết</label>
            <app-text-editor [(ngModel)]="form.description" />
          </div>
        </fieldset>

        <!-- ===== TAGS ===== -->
        <fieldset class="space-y-3">
          <legend class="text-sm font-semibold mb-1" style="color: var(--cr-text-primary);">Tags</legend>

          <!-- Chips-like tag display -->
          <div class="flex flex-wrap gap-2">
            @for (tag of form.tagList; track $index) {
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium" style="background: rgba(88, 166, 255, 0.12); color: var(--cr-accent-blue); border: 1px solid rgba(88, 166, 255, 0.2);">
                {{ tag }}
                <button type="button" class="hover:text-red-500 transition-colors" (click)="removeTag($index)">
                  <i class="pi pi-times text-[10px]"></i>
                </button>
              </span>
            }
          </div>
          <div class="flex gap-2">
            <input
              pInputText
              [(ngModel)]="newTag"
              class="flex-1"
              placeholder="Nhập tag rồi nhấn Enter hoặc nút Thêm"
              (keyup.enter)="addTag()"
            />
            <p-button icon="pi pi-plus" size="small" [text]="true" (onClick)="addTag()" [disabled]="!newTag.trim()" />
          </div>
        </fieldset>

        <!-- ===== LEARNING OBJECTIVES ===== -->
        <fieldset class="space-y-3">
          <legend class="text-sm font-semibold mb-1" style="color: var(--cr-text-primary);">Mục tiêu học tập</legend>

          @for (obj of form.objectivesList; track $index) {
            <div class="flex gap-2 items-center">
              <span class="text-xs w-5 shrink-0 text-center" style="color: var(--cr-text-subtle);">{{ $index + 1 }}.</span>
              <input pInputText [(ngModel)]="form.objectivesList[$index]" class="flex-1" placeholder="Nhập mục tiêu học tập" />
              <p-button icon="pi pi-trash" [text]="true" severity="danger" size="small" (onClick)="removeObjective($index)" />
            </div>
          }
          <p-button label="Thêm mục tiêu" icon="pi pi-plus" size="small" [text]="true" (onClick)="addObjective()" />
        </fieldset>

        <!-- ===== PREREQUISITES ===== -->
        <fieldset class="space-y-3">
          <legend class="text-sm font-semibold mb-1" style="color: var(--cr-text-primary);">Yêu cầu tiên quyết</legend>

          @for (prereq of form.prerequisitesList; track $index) {
            <div class="flex gap-2 items-center">
              <span class="text-xs w-5 shrink-0 text-center" style="color: var(--cr-text-subtle);">{{ $index + 1 }}.</span>
              <input pInputText [(ngModel)]="form.prerequisitesList[$index]" class="flex-1" placeholder="Nhập yêu cầu tiên quyết" />
              <p-button icon="pi pi-trash" [text]="true" severity="danger" size="small" (onClick)="removePrerequisite($index)" />
            </div>
          }
          <p-button label="Thêm yêu cầu" icon="pi pi-plus" size="small" [text]="true" (onClick)="addPrerequisite()" />
        </fieldset>

        <!-- ===== SETTINGS ===== -->
        <fieldset class="space-y-4">
          <legend class="text-sm font-semibold mb-1" style="color: var(--cr-text-primary);">Cài đặt</legend>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium" style="color: var(--cr-text-muted);">Thời lượng ước tính (phút)</label>
              <p-inputNumber [(ngModel)]="form.estimatedDurationMinutes" [min]="0" styleClass="w-full" placeholder="vd: 600" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium" style="color: var(--cr-text-muted);">Số SV tối đa (0 = không giới hạn)</label>
              <p-inputNumber [(ngModel)]="form.maxStudents" [min]="0" styleClass="w-full" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex items-center gap-2">
              <p-toggleSwitch [(ngModel)]="form.isPublic" />
              <label class="text-sm" style="color: var(--cr-text-secondary);">Công khai</label>
            </div>
          </div>

          <!-- Password (only for private courses) -->
          @if (!form.isPublic) {
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium" style="color: var(--cr-text-muted);">Mật khẩu khóa học <span style="color: var(--cr-accent-red);">*</span></label>
              <input pInputText type="password" [(ngModel)]="form.password" class="w-full" placeholder="Nhập mật khẩu cho khóa học riêng tư" />
              <small class="text-xs mt-1 block" style="color: var(--cr-text-subtle);">Sinh viên sẽ cần nhập mật khẩu này để đăng ký khóa học.</small>
            </div>
          }

          <!-- Thumbnail -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium" style="color: var(--cr-text-muted);">URL ảnh bìa</label>
            <input pInputText [(ngModel)]="form.thumbnailUrl" class="w-full" placeholder="https://..." />
          </div>
        </fieldset>
      </div>

      <ng-template #footer>
        <div class="flex justify-end gap-2 pt-2">
          <p-button label="Hủy" severity="secondary" [text]="true" (onClick)="onCancel()" [disabled]="submitting()" />
          <p-button [label]="editing() ? 'Cập nhật' : 'Tạo'" icon="pi pi-check" (onClick)="onSave()" [loading]="submitting()" [disabled]="!isValid()" />
        </div>
      </ng-template>
    </p-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCourseFormDialogComponent {
  readonly visible = input<boolean>(false);
  readonly course = input<CoursesModel | null>(null);
  readonly submitting = input<boolean>(false);

  readonly visibleChange = output<boolean>();
  readonly save = output<any>();

  readonly editing = signal(false);

  form: any = this.getEmptyForm();
  newTag = '';

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

  constructor() {
    effect(() => {
      const c = this.course();
      if (c) {
        this.editing.set(true);
        this.form = {
          title: c.title,
          slug: c.slug,
          summary: c.summary || '',
          description: c.description || '',
          level: c.level,
          status: c.status,
          isPublic: c.isPublic,
          password: c.password || '',
          maxStudents: c.maxStudents,
          estimatedDurationMinutes: c.estimatedDurationMinutes,
          category: c.category || '',
          thumbnailUrl: c.thumbnailUrl || '',
          tagList: c.tags ? c.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
          objectivesList: this.parseJsonArray(c.learningObjectives),
          prerequisitesList: this.parseJsonArray(c.prerequisites),
        };
      } else {
        this.editing.set(false);
        this.form = this.getEmptyForm();
      }
    });
  }

  // ===== TAG MANAGEMENT =====

  addTag(): void {
    const tag = this.newTag.trim();
    if (tag && !this.form.tagList.includes(tag)) {
      this.form.tagList = [...this.form.tagList, tag];
    }
    this.newTag = '';
  }

  removeTag(index: number): void {
    this.form.tagList = this.form.tagList.filter((_: string, i: number) => i !== index);
  }

  // ===== LEARNING OBJECTIVES =====

  addObjective(): void {
    this.form.objectivesList = [...this.form.objectivesList, ''];
  }

  removeObjective(index: number): void {
    this.form.objectivesList = this.form.objectivesList.filter((_: string, i: number) => i !== index);
  }

  // ===== PREREQUISITES =====

  addPrerequisite(): void {
    this.form.prerequisitesList = [...this.form.prerequisitesList, ''];
  }

  removePrerequisite(index: number): void {
    this.form.prerequisitesList = this.form.prerequisitesList.filter((_: string, i: number) => i !== index);
  }

  // ===== SLUG AUTO-GENERATION =====

  autoGenerateSlug(): void {
    if (!this.editing()) {
      this.form.slug = this.toSlug(this.form.title);
    }
  }

  // ===== VALIDATION & SAVE =====

  isValid(): boolean {
    if (!this.form.title?.trim() || !this.form.slug?.trim()) return false;
    // Private courses require a password
    if (!this.form.isPublic && !this.form.password?.trim()) return false;
    return true;
  }

  onSave(): void {
    if (!this.isValid()) return;

    const data: any = {
      title: this.form.title,
      slug: this.form.slug,
      summary: this.form.summary || undefined,
      description: this.form.description || undefined,
      level: this.form.level,
      isPublic: this.form.isPublic,
      password: !this.form.isPublic ? this.form.password : undefined,
      maxStudents: this.form.maxStudents,
      estimatedDurationMinutes: this.form.estimatedDurationMinutes,
      category: this.form.category || undefined,
      thumbnailUrl: this.form.thumbnailUrl || undefined,
      tags: this.form.tagList.length > 0 ? this.form.tagList.join(',') : undefined,
      learningObjectives: this.serializeArray(this.form.objectivesList),
      prerequisites: this.serializeArray(this.form.prerequisitesList),
    };

    // status is only allowed on update, not create
    if (this.editing()) {
      data.status = this.form.status;
    }

    // Remove undefined values
    Object.keys(data).forEach((key) => {
      if (data[key] === undefined) delete data[key];
    });

    this.save.emit(data);
  }

  onCancel(): void {
    this.visibleChange.emit(false);
  }

  onVisibleChange(visible: boolean): void {
    this.visibleChange.emit(visible);
  }

  // ===== HELPERS =====

  private getEmptyForm(): any {
    return {
      title: '',
      slug: '',
      summary: '',
      description: '',
      level: CourseLevelEnum.Beginner,
      status: CourseStatusEnum.Draft,
      isPublic: true,
      password: '',
      maxStudents: 0,
      estimatedDurationMinutes: null,
      category: '',
      thumbnailUrl: '',
      tagList: [] as string[],
      objectivesList: [] as string[],
      prerequisitesList: [] as string[],
    };
  }

  private parseJsonArray(value: string | null | undefined): string[] {
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter((s: any) => typeof s === 'string') : [];
    } catch {
      return [];
    }
  }

  private serializeArray(list: string[]): string | undefined {
    const filtered = list.filter((s) => s.trim());
    return filtered.length > 0 ? JSON.stringify(filtered) : undefined;
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
