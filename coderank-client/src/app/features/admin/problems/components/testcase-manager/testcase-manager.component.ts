import { Component, ChangeDetectionStrategy, input, output, signal, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Textarea } from 'primeng/textarea';
import { Checkbox } from 'primeng/checkbox';
import { Select } from 'primeng/select';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TestcasesModel } from '../../../../../data/models/testcases.model';
import { CreateTestcaseDto, UpdateTestcaseDto } from '../../../../../data/dto/problems';
import { TestcaseCompareTypeEnum } from '../../../../../data/enums/enums';
import { AdminProblemsService } from '../../services/admin-problems.service';
import { CommonModule } from '@angular/common';

interface CompareTypeOption {
  label: string;
  value: TestcaseCompareTypeEnum;
}

@Component({
  selector: 'app-testcase-manager',
  imports: [
    CommonModule,
    TableModule,
    Button,
    Dialog,
    Textarea,
    Checkbox,
    Select,
    ConfirmDialog,
    Toast,
    ReactiveFormsModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './testcase-manager.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestcaseManagerComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly adminService = inject(AdminProblemsService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  // Inputs
  readonly problemId = input<string>('');

  // Outputs
  readonly close = output<void>();

  // State
  readonly testcases = signal<TestcasesModel[]>([]);
  readonly loading = signal<boolean>(false);
  readonly showDialog = signal<boolean>(false);
  readonly editingTestcase = signal<TestcasesModel | null>(null);
  readonly isSubmitting = signal<boolean>(false);
  form!: FormGroup;

  compareTypeOptions: CompareTypeOption[] = [
    { label: 'Exact Match', value: TestcaseCompareTypeEnum.Exact },
    { label: 'Trim Whitespace', value: TestcaseCompareTypeEnum.TrimWhitespace },
    { label: 'Tokenize', value: TestcaseCompareTypeEnum.Tokenize }
  ];

  ngOnInit(): void {
    this.loadTestcases();
  }

  private loadTestcases(): void {
    if (!this.problemId()) return;
    
    this.loading.set(true);
    this.adminService.getTestcases(this.problemId()).subscribe({
      next: (response) => {
        this.testcases.set(response.data || []);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load testcases',
        });
        this.loading.set(false);
      },
    });
  }

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

    if (!this.problemId()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Problem ID is missing'
      });
      return;
    }

    const formValue = this.form.value;
    const editing = this.editingTestcase();
    this.isSubmitting.set(true);

    if (editing) {
      // Update
      this.adminService.updateTestcase(this.problemId(), editing.id.toString(), formValue).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Testcase updated successfully',
          });
          this.closeDialog();
          this.isSubmitting.set(false);
          this.loadTestcases();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update testcase',
          });
          this.isSubmitting.set(false);
        },
      });
    } else {
      // Create
      this.adminService.createTestcase(this.problemId(), formValue).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Testcase created successfully',
          });
          this.closeDialog();
          this.isSubmitting.set(false);
          this.loadTestcases();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create testcase',
          });
          this.isSubmitting.set(false);
        },
      });
    }
  }

  confirmDelete(testcase: TestcasesModel): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this testcase?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        if (!this.problemId()) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Problem ID is missing'
          });
          return;
        }

        this.isSubmitting.set(true);
        this.adminService.deleteTestcase(this.problemId(), testcase.id.toString()).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Testcase deleted successfully',
            });
            this.isSubmitting.set(false);
            this.loadTestcases();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete testcase',
            });
            this.isSubmitting.set(false);
          },
        });
      }
    });
  }

  truncateText(text: string, maxLength: number = 50): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
}
