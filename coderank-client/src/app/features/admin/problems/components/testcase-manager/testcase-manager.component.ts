import { Component, ChangeDetectionStrategy, input, output, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Textarea } from 'primeng/textarea';
import { Checkbox } from 'primeng/checkbox';
import { Select } from 'primeng/select';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { TestcasesModel } from '../../../../../data/models/testcases.model';
import { CreateTestcaseDto, UpdateTestcaseDto } from '../../../../../data/dto/problems';
import { TestcaseCompareTypeEnum } from '../../../../../data/enums/enums';

interface CompareTypeOption {
  label: string;
  value: TestcaseCompareTypeEnum;
}

@Component({
  selector: 'app-testcase-manager',
  imports: [
    TableModule,
    Button,
    Dialog,
    Textarea,
    Checkbox,
    Select,
    ConfirmDialog,
    ReactiveFormsModule
  ],
  providers: [ConfirmationService],
  templateUrl: './testcase-manager.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestcaseManagerComponent {
  private fb = inject(FormBuilder);
  private confirmationService = inject(ConfirmationService);

  // Inputs
  testcases = input<TestcasesModel[]>([]);
  loading = input<boolean>(false);

  // Outputs
  create = output<CreateTestcaseDto>();
  update = output<{ id: string; dto: UpdateTestcaseDto }>();
  delete = output<string>();

  // State
  showDialog = signal<boolean>(false);
  editingTestcase = signal<TestcasesModel | null>(null);
  form!: FormGroup;

  compareTypeOptions: CompareTypeOption[] = [
    { label: 'Exact Match', value: TestcaseCompareTypeEnum.Exact },
    { label: 'Trim Whitespace', value: TestcaseCompareTypeEnum.TrimWhitespace },
    { label: 'Tokenize', value: TestcaseCompareTypeEnum.Tokenize }
  ];

  constructor() {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      input: ['', Validators.required],
      expectedOutput: ['', Validators.required],
      isSample: [true],
      compareType: [TestcaseCompareTypeEnum.TrimWhitespace, Validators.required]
    });
  }

  openCreateDialog(): void {
    this.editingTestcase.set(null);
    this.form.reset({
      input: '',
      expectedOutput: '',
      isSample: true,
      compareType: TestcaseCompareTypeEnum.TrimWhitespace
    });
    this.showDialog.set(true);
  }

  openEditDialog(testcase: TestcasesModel): void {
    this.editingTestcase.set(testcase);
    this.form.patchValue({
      input: testcase.input,
      expectedOutput: testcase.expectedOutput,
      isSample: testcase.isSample,
      compareType: testcase.compareType
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

    const formValue = this.form.value;
    const editing = this.editingTestcase();

    if (editing) {
      this.update.emit({ id: editing.id.toString(), dto: formValue });
    } else {
      this.create.emit(formValue);
    }

    this.closeDialog();
  }

  confirmDelete(testcase: TestcasesModel): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this testcase?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.delete.emit(testcase.id.toString());
      }
    });
  }

  truncateText(text: string, maxLength: number = 50): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
}
