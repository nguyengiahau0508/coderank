import { Component, ChangeDetectionStrategy, input, output, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { InputNumber } from 'primeng/inputnumber';
import { ToggleSwitch } from 'primeng/toggleswitch';

import { TextEditorComponent } from '../../../../../shared/components/text-editor/text-editor.component';
import { ContestsModel } from '../../../../../data';
import { ContestStatusEnum } from '../../../../../data';

@Component({
  selector: 'app-admin-contest-form-dialog',
  imports: [
    CommonModule,
    FormsModule,
    Button,
    InputText,
    Select,
    DatePicker,
    InputNumber,
    ToggleSwitch,
    TextEditorComponent,
  ],
  templateUrl: './contest-form-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminContestFormDialogComponent {
  contest = input<ContestsModel | null>(null);
  loading = input<boolean>(false);
  save = output<any>();
  cancel = output<void>();

  // Form fields
  title = signal('');
  slug = signal('');
  description = signal('');
  rules = signal('');
  startTime = signal<Date | null>(null);
  endTime = signal<Date | null>(null);
  durationMinutes = signal<number | null>(null);
  status = signal<ContestStatusEnum>(ContestStatusEnum.Draft);
  isPublic = signal(false);
  isRated = signal(false);
  maxParticipants = signal<number>(0);
  password = signal('');

  readonly statusOptions = [
    { label: 'Nháp', value: ContestStatusEnum.Draft },
    { label: 'Sắp diễn ra', value: ContestStatusEnum.Upcoming },
    { label: 'Đang diễn ra', value: ContestStatusEnum.Running },
    { label: 'Đã kết thúc', value: ContestStatusEnum.Ended },
  ];

  constructor() {
    effect(() => {
      const c = this.contest();
      if (c) {
        this.title.set(c.title || '');
        this.slug.set(c.slug || '');
        this.description.set(c.description || '');
        this.rules.set(c.rules || '');
        this.startTime.set(c.startTime ? new Date(c.startTime) : null);
        this.endTime.set(c.endTime ? new Date(c.endTime) : null);
        this.durationMinutes.set(c.durationMinutes ?? null);
        this.status.set(c.status || ContestStatusEnum.Draft);
        this.isPublic.set(c.isPublic ?? false);
        this.isRated.set(c.isRated ?? false);
        this.maxParticipants.set(c.maxParticipants ?? 0);
        this.password.set(c.password || '');
      } else {
        this.title.set('');
        this.slug.set('');
        this.description.set('');
        this.rules.set('');
        this.startTime.set(null);
        this.endTime.set(null);
        this.durationMinutes.set(null);
        this.status.set(ContestStatusEnum.Draft);
        this.isPublic.set(false);
        this.isRated.set(false);
        this.maxParticipants.set(0);
        this.password.set('');
      }
    });
  }

  generateSlug(): void {
    const slug = this.title()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    this.slug.set(slug);
  }

  // ==================== Auto-calculate ====================

  private _updatingTime = false;

  onStartTimeChange(value: Date | null): void {
    this.startTime.set(value);
    if (this._updatingTime) return;
    this._updatingTime = true;

    const end = this.endTime();
    if (value && end) {
      const diffMs = end.getTime() - value.getTime();
      if (diffMs > 0) {
        this.durationMinutes.set(Math.round(diffMs / 60000));
      }
    } else if (value && this.durationMinutes()) {
      this.endTime.set(new Date(value.getTime() + this.durationMinutes()! * 60000));
    }

    this._updatingTime = false;
  }

  onEndTimeChange(value: Date | null): void {
    this.endTime.set(value);
    if (this._updatingTime) return;
    this._updatingTime = true;

    const start = this.startTime();
    if (value && start) {
      const diffMs = value.getTime() - start.getTime();
      if (diffMs > 0) {
        this.durationMinutes.set(Math.round(diffMs / 60000));
      }
    }

    this._updatingTime = false;
  }

  onDurationChange(value: number | null): void {
    this.durationMinutes.set(value);
    if (this._updatingTime) return;
    this._updatingTime = true;

    const start = this.startTime();
    if (value && value > 0 && start) {
      this.endTime.set(new Date(start.getTime() + value * 60000));
    }

    this._updatingTime = false;
  }

  // ==================== Submit ====================

  private toISOString(value: any): string {
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'string') return new Date(value).toISOString();
    return new Date(value).toISOString();
  }

  onSubmit(): void {
    if (!this.title().trim() || !this.slug().trim()) return;
    if (!this.startTime() || !this.endTime()) return;

    const data: any = {
      title: this.title().trim(),
      slug: this.slug().trim(),
      startTime: this.toISOString(this.startTime()),
      endTime: this.toISOString(this.endTime()),
      status: this.status(),
      isPublic: this.isPublic(),
      isRated: this.isRated(),
      maxParticipants: this.maxParticipants(),
    };

    if (this.description()) data.description = this.description();
    if (this.rules()) data.rules = this.rules();
    if (this.durationMinutes()) data.durationMinutes = this.durationMinutes();
    if (this.password() && !this.isPublic()) data.password = this.password();

    this.save.emit(data);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
