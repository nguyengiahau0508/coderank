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
  templateUrl: './course-form-dialog.component.html',
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
