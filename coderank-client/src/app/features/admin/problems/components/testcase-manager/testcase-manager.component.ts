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
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Textarea } from 'primeng/textarea';
import { Checkbox } from 'primeng/checkbox';
import { Select } from 'primeng/select';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { Tag } from 'primeng/tag';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TestcasesModel } from '../../../../../data';
import { CreateTestcaseDto, UpdateTestcaseDto } from '../../../../../data';
import { TestcaseCompareTypeEnum } from '../../../../../data';
import { TestcasesService } from '../../../../../shared/services/problems/testcases.service';

interface CompareTypeOption {
  label: string;
  value: TestcaseCompareTypeEnum;
}

@Component({
  selector: 'app-admin-testcase-manager',
  imports: [
    TableModule,
    Button,
    Dialog,
    Textarea,
    Checkbox,
    Select,
    ConfirmDialog,
    Toast,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './testcase-manager.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminTestcaseManagerComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly testcasesService = inject(TestcasesService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  /** ID của bài tập đang quản lý testcase */
  readonly problemId = input<string>('');

  /** Event đóng dialog cha */
  readonly close = output<void>();

  /** Danh sách testcase */
  readonly testcases = signal<TestcasesModel[]>([]);
  readonly loading = signal(false);

  /** Dialog thêm/sửa */
  readonly showDialog = signal(false);
  readonly editingTestcase = signal<TestcasesModel | null>(null);
  readonly isSubmitting = signal(false);

  /** Dialog preview input/output */
  readonly showPreviewDialog = signal(false);
  readonly previewTitle = signal('');
  readonly previewContent = signal('');

  /** Bulk selection */
  readonly selectedTestcases = signal<TestcasesModel[]>([]);
  readonly isAllSelected = computed(
    () =>
      this.testcases().length > 0 &&
      this.selectedTestcases().length === this.testcases().length,
  );

  /** Thống kê */
  readonly sampleCount = computed(
    () => this.testcases().filter((tc) => tc.isSample).length,
  );
  readonly hiddenCount = computed(
    () => this.testcases().filter((tc) => !tc.isSample).length,
  );

  /** Form */
  form!: FormGroup;

  readonly compareTypeOptions: CompareTypeOption[] = [
    { label: 'So khớp chính xác', value: TestcaseCompareTypeEnum.Exact },
    { label: 'Bỏ khoảng trắng thừa', value: TestcaseCompareTypeEnum.TrimWhitespace },
    { label: 'So từng token', value: TestcaseCompareTypeEnum.Tokenize },
  ];

  constructor() {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadTestcases();
  }

  // ─── DATA ──────────────────────────────────────────────

  private loadTestcases(): void {
    if (!this.problemId()) return;

    this.loading.set(true);
    this.testcasesService.getTestcases(this.problemId()).subscribe({
      next: (res) => {
        this.testcases.set(res.data ?? []);
        this.selectedTestcases.set([]);
        this.loading.set(false);
      },
      error: () => {
        this.toast('error', 'Không thể tải danh sách testcase');
        this.loading.set(false);
      },
    });
  }

  // ─── FORM ──────────────────────────────────────────────

  private initForm(): void {
    this.form = this.fb.group({
      input: ['', Validators.required],
      expectedOutput: ['', Validators.required],
      isSample: [true],
      compareType: [TestcaseCompareTypeEnum.TrimWhitespace, Validators.required],
    });
  }

  openCreateDialog(): void {
    this.editingTestcase.set(null);
    this.form.reset({
      input: '',
      expectedOutput: '',
      isSample: true,
      compareType: TestcaseCompareTypeEnum.TrimWhitespace,
    });
    this.showDialog.set(true);
  }

  openEditDialog(testcase: TestcasesModel): void {
    this.editingTestcase.set(testcase);
    this.form.patchValue({
      input: testcase.input,
      expectedOutput: testcase.expectedOutput,
      isSample: testcase.isSample,
      compareType: testcase.compareType,
    });
    this.showDialog.set(true);
  }

  closeDialog(): void {
    this.showDialog.set(false);
    this.editingTestcase.set(null);
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
    const editing = this.editingTestcase();
    this.isSubmitting.set(true);

    if (editing) {
      this.testcasesService
        .updateTestcase(this.problemId(), editing.id.toString(), formValue)
        .subscribe({
          next: () => {
            this.toast('success', 'Đã cập nhật testcase');
            this.closeDialog();
            this.isSubmitting.set(false);
            this.loadTestcases();
          },
          error: () => {
            this.toast('error', 'Không thể cập nhật testcase');
            this.isSubmitting.set(false);
          },
        });
    } else {
      this.testcasesService
        .createTestcase(this.problemId(), formValue)
        .subscribe({
          next: () => {
            this.toast('success', 'Đã thêm testcase');
            this.closeDialog();
            this.isSubmitting.set(false);
            this.loadTestcases();
          },
          error: () => {
            this.toast('error', 'Không thể thêm testcase');
            this.isSubmitting.set(false);
          },
        });
    }
  }

  // ─── DELETE ─────────────────────────────────────────────

  confirmDelete(testcase: TestcasesModel): void {
    this.confirmationService.confirm({
      message: 'Bạn có chắc muốn xóa testcase này?',
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Xóa',
      rejectLabel: 'Hủy',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteTestcase(testcase.id.toString()),
    });
  }

  confirmBulkDelete(): void {
    const count = this.selectedTestcases().length;
    if (count === 0) return;

    this.confirmationService.confirm({
      message: `Bạn có chắc muốn xóa ${count} testcase đã chọn?`,
      header: 'Xác nhận xóa hàng loạt',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Xóa tất cả',
      rejectLabel: 'Hủy',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.bulkDelete(),
    });
  }

  private deleteTestcase(testcaseId: string): void {
    if (!this.problemId()) return;

    this.isSubmitting.set(true);
    this.testcasesService
      .deleteTestcase(this.problemId(), testcaseId)
      .subscribe({
        next: () => {
          this.toast('success', 'Đã xóa testcase');
          this.isSubmitting.set(false);
          this.loadTestcases();
        },
        error: () => {
          this.toast('error', 'Không thể xóa testcase');
          this.isSubmitting.set(false);
        },
      });
  }

  private bulkDelete(): void {
    if (!this.problemId()) return;

    const ids = this.selectedTestcases().map((tc) => tc.id.toString());
    this.isSubmitting.set(true);

    let completed = 0;
    let failed = 0;

    ids.forEach((id) => {
      this.testcasesService.deleteTestcase(this.problemId(), id).subscribe({
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
      this.toast('success', `Đã xóa ${completed} testcase`);
    } else {
      this.toast('warn', `Đã xóa ${completed}, lỗi ${failed} testcase`);
    }
    this.loadTestcases();
  }

  // ─── SELECTION ──────────────────────────────────────────

  toggleSelectAll(): void {
    if (this.isAllSelected()) {
      this.selectedTestcases.set([]);
    } else {
      this.selectedTestcases.set([...this.testcases()]);
    }
  }

  toggleSelect(tc: TestcasesModel): void {
    const current = this.selectedTestcases();
    const idx = current.findIndex((s) => s.id === tc.id);
    if (idx >= 0) {
      this.selectedTestcases.set(current.filter((s) => s.id !== tc.id));
    } else {
      this.selectedTestcases.set([...current, tc]);
    }
  }

  isSelected(tc: TestcasesModel): boolean {
    return this.selectedTestcases().some((s) => s.id === tc.id);
  }

  // ─── PREVIEW ────────────────────────────────────────────

  openPreview(title: string, content: string): void {
    this.previewTitle.set(title);
    this.previewContent.set(content || '(trống)');
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

  exportTestcases(): void {
    const data = this.testcases().map((tc, i) => ({
      order: i + 1,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      isSample: tc.isSample,
      compareType: tc.compareType,
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `testcases-${this.problemId()}.json`;
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
        const data = JSON.parse(reader.result as string) as CreateTestcaseDto[];
        if (!Array.isArray(data) || data.length === 0) {
          this.toast('error', 'File không đúng định dạng');
          return;
        }
        this.importTestcases(data);
      } catch {
        this.toast('error', 'Không thể đọc file JSON');
      }
    };
    reader.readAsText(file);

    // Reset input để có thể import lại cùng file
    input.value = '';
  }

  private importTestcases(dtos: CreateTestcaseDto[]): void {
    if (!this.problemId()) return;

    this.isSubmitting.set(true);
    let completed = 0;
    let failed = 0;

    dtos.forEach((dto) => {
      this.testcasesService.createTestcase(this.problemId(), dto).subscribe({
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
      this.toast('success', `Đã import ${completed} testcase`);
    } else {
      this.toast('warn', `Import ${completed} thành công, ${failed} lỗi`);
    }
    this.loadTestcases();
  }

  // ─── HELPERS ────────────────────────────────────────────

  truncateText(text: string, maxLength = 40): string {
    if (!text) return '(trống)';
    return text.length > maxLength
      ? text.substring(0, maxLength) + '…'
      : text;
  }

  lineCount(text: string): number {
    if (!text) return 0;
    return text.split('\n').length;
  }

  getCompareTypeLabel(type: TestcaseCompareTypeEnum): string {
    return (
      this.compareTypeOptions.find((o) => o.value === type)?.label ?? type
    );
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
