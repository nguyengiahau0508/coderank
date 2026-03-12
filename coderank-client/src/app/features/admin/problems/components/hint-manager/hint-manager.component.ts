import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  inject,
  OnInit,
  computed,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Textarea } from 'primeng/textarea';
import { InputNumber } from 'primeng/inputnumber';
import { Checkbox } from 'primeng/checkbox';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { Tooltip } from 'primeng/tooltip';
import { Tag } from 'primeng/tag';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HintsModel } from '../../../../../data/models/hints.model';
import { CreateHintDto } from '../../../../../data/dto/problems';
import { HintsService } from '../../services/hints.service';

@Component({
  selector: 'app-admin-hint-manager',
  imports: [
    Button,
    Dialog,
    Textarea,
    InputNumber,
    Checkbox,
    ConfirmDialog,
    Toast,
    Tooltip,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './hint-manager.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminHintManagerComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly hintsService = inject(HintsService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  /** ID của bài tập đang quản lý gợi ý */
  readonly problemId = input<string>('');

  /** Event đóng dialog cha */
  readonly close = output<void>();

  /** Danh sách hints */
  readonly hints = signal<HintsModel[]>([]);
  readonly loading = signal(false);

  /** Dialog thêm/sửa */
  readonly showDialog = signal(false);
  readonly editingHint = signal<HintsModel | null>(null);
  readonly isSubmitting = signal(false);

  /** Dialog preview nội dung */
  readonly showPreviewDialog = signal(false);
  readonly previewContent = signal('');
  readonly previewOrder = signal(0);

  /** Bulk selection */
  readonly selectedHints = signal<HintsModel[]>([]);
  readonly isAllSelected = computed(
    () =>
      this.hints().length > 0 &&
      this.selectedHints().length === this.hints().length,
  );

  /** Thống kê */
  readonly publicCount = computed(
    () => this.hints().filter((h) => h.isPublic).length,
  );
  readonly hiddenCount = computed(
    () => this.hints().filter((h) => !h.isPublic).length,
  );

  /** Form */
  form!: FormGroup;

  constructor() {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadHints();
  }

  // ─── DATA ──────────────────────────────────────────────

  private loadHints(): void {
    if (!this.problemId()) return;

    this.loading.set(true);
    this.hintsService.getHints(this.problemId()).subscribe({
      next: (res) => {
        this.hints.set(res.data ?? []);
        this.selectedHints.set([]);
        this.loading.set(false);
      },
      error: () => {
        this.toast('error', 'Không thể tải danh sách gợi ý');
        this.loading.set(false);
      },
    });
  }

  // ─── FORM ──────────────────────────────────────────────

  private initForm(): void {
    this.form = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(5)]],
      hintOrder: [1, [Validators.required, Validators.min(1)]],
      isPublic: [true],
    });
  }

  openCreateDialog(): void {
    this.editingHint.set(null);
    const nextOrder = this.hints().length + 1;
    this.form.reset({
      content: '',
      hintOrder: nextOrder,
      isPublic: true,
    });
    this.showDialog.set(true);
  }

  openEditDialog(hint: HintsModel): void {
    this.editingHint.set(hint);
    this.form.patchValue({
      content: hint.content,
      hintOrder: hint.hintOrder,
      isPublic: hint.isPublic,
    });
    this.showDialog.set(true);
  }

  closeDialog(): void {
    this.showDialog.set(false);
    this.editingHint.set(null);
    this.form.reset();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.problemId()) {
      this.toast('error', 'Thiếu ID bài tập');
      return;
    }

    const formValue = this.form.value;
    const editing = this.editingHint();
    this.isSubmitting.set(true);

    if (editing) {
      this.hintsService
        .updateHint(this.problemId(), editing.id.toString(), formValue)
        .subscribe({
          next: () => {
            this.toast('success', 'Đã cập nhật gợi ý');
            this.closeDialog();
            this.isSubmitting.set(false);
            this.loadHints();
          },
          error: () => {
            this.toast('error', 'Không thể cập nhật gợi ý');
            this.isSubmitting.set(false);
          },
        });
    } else {
      this.hintsService
        .createHint(this.problemId(), formValue)
        .subscribe({
          next: () => {
            this.toast('success', 'Đã thêm gợi ý');
            this.closeDialog();
            this.isSubmitting.set(false);
            this.loadHints();
          },
          error: () => {
            this.toast('error', 'Không thể thêm gợi ý');
            this.isSubmitting.set(false);
          },
        });
    }
  }

  // ─── DELETE ─────────────────────────────────────────────

  confirmDelete(hint: HintsModel): void {
    this.confirmationService.confirm({
      message: 'Bạn có chắc muốn xóa gợi ý này?',
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Xóa',
      rejectLabel: 'Hủy',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteHint(hint.id.toString()),
    });
  }

  confirmBulkDelete(): void {
    const count = this.selectedHints().length;
    if (count === 0) return;

    this.confirmationService.confirm({
      message: `Bạn có chắc muốn xóa ${count} gợi ý đã chọn?`,
      header: 'Xác nhận xóa hàng loạt',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Xóa tất cả',
      rejectLabel: 'Hủy',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.bulkDelete(),
    });
  }

  private deleteHint(hintId: string): void {
    if (!this.problemId()) return;

    this.isSubmitting.set(true);
    this.hintsService
      .deleteHint(this.problemId(), hintId)
      .subscribe({
        next: () => {
          this.toast('success', 'Đã xóa gợi ý');
          this.isSubmitting.set(false);
          this.loadHints();
        },
        error: () => {
          this.toast('error', 'Không thể xóa gợi ý');
          this.isSubmitting.set(false);
        },
      });
  }

  private bulkDelete(): void {
    if (!this.problemId()) return;

    const ids = this.selectedHints().map((h) => h.id.toString());
    this.isSubmitting.set(true);

    let completed = 0;
    let failed = 0;

    ids.forEach((id) => {
      this.hintsService.deleteHint(this.problemId(), id).subscribe({
        next: () => {
          completed++;
          if (completed + failed === ids.length) {
            this.finishBulkDelete(completed, failed);
          }
        },
        error: () => {
          failed++;
          if (completed + failed === ids.length) {
            this.finishBulkDelete(completed, failed);
          }
        },
      });
    });
  }

  private finishBulkDelete(completed: number, failed: number): void {
    this.isSubmitting.set(false);
    if (failed === 0) {
      this.toast('success', `Đã xóa ${completed} gợi ý`);
    } else {
      this.toast('warn', `Đã xóa ${completed}, lỗi ${failed} gợi ý`);
    }
    this.loadHints();
  }

  // ─── SELECTION ──────────────────────────────────────────

  toggleSelectAll(): void {
    if (this.isAllSelected()) {
      this.selectedHints.set([]);
    } else {
      this.selectedHints.set([...this.hints()]);
    }
  }

  toggleSelect(hint: HintsModel): void {
    const current = this.selectedHints();
    const idx = current.findIndex((s) => s.id === hint.id);
    if (idx >= 0) {
      this.selectedHints.set(current.filter((s) => s.id !== hint.id));
    } else {
      this.selectedHints.set([...current, hint]);
    }
  }

  isSelected(hint: HintsModel): boolean {
    return this.selectedHints().some((s) => s.id === hint.id);
  }

  // ─── PREVIEW ────────────────────────────────────────────

  openPreview(hint: HintsModel): void {
    this.previewContent.set(hint.content || '(trống)');
    this.previewOrder.set(hint.hintOrder);
    this.showPreviewDialog.set(true);
  }

  closePreview(): void {
    this.showPreviewDialog.set(false);
  }

  async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.toast('success', 'Đã sao chép vào clipboard');
    } catch {
      this.toast('error', 'Không thể sao chép');
    }
  }

  // ─── IMPORT / EXPORT ──────────────────────────────────

  exportHints(): void {
    const data = this.hints().map((h) => ({
      hintOrder: h.hintOrder,
      content: h.content,
      isPublic: h.isPublic,
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hints-${this.problemId()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  onImportFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as CreateHintDto[];
        if (!Array.isArray(data) || data.length === 0) {
          this.toast('error', 'File không đúng định dạng');
          return;
        }
        this.importHints(data);
      } catch {
        this.toast('error', 'Không thể đọc file JSON');
      }
    };
    reader.readAsText(file);
    input.value = '';
  }

  private importHints(dtos: CreateHintDto[]): void {
    if (!this.problemId()) return;

    this.isSubmitting.set(true);
    let completed = 0;
    let failed = 0;

    dtos.forEach((dto) => {
      this.hintsService.createHint(this.problemId(), dto).subscribe({
        next: () => {
          completed++;
          if (completed + failed === dtos.length) {
            this.finishImport(completed, failed);
          }
        },
        error: () => {
          failed++;
          if (completed + failed === dtos.length) {
            this.finishImport(completed, failed);
          }
        },
      });
    });
  }

  private finishImport(completed: number, failed: number): void {
    this.isSubmitting.set(false);
    if (failed === 0) {
      this.toast('success', `Đã import ${completed} gợi ý`);
    } else {
      this.toast('warn', `Import ${completed} thành công, ${failed} lỗi`);
    }
    this.loadHints();
  }

  // ─── HELPERS ────────────────────────────────────────────

  truncateText(text: string, maxLength = 80): string {
    if (!text) return '(trống)';
    return text.length > maxLength
      ? text.substring(0, maxLength) + '…'
      : text;
  }

  private toast(
    severity: 'success' | 'error' | 'warn' | 'info',
    detail: string,
  ): void {
    this.messageService.add({
      severity,
      summary:
        severity === 'success'
          ? 'Thành công'
          : severity === 'error'
            ? 'Lỗi'
            : severity === 'warn'
              ? 'Cảnh báo'
              : 'Thông báo',
      detail,
      life: 3000,
    });
  }
}
