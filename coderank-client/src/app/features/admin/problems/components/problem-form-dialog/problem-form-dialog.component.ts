import { Component, ChangeDetectionStrategy, input, output, signal, effect, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { InputNumber } from 'primeng/inputnumber';
import { Checkbox } from 'primeng/checkbox';
import { TextEditorComponent } from '../../../../../shared/components/text-editor/text-editor.component';
import { DifficultyEnum } from '../../../../../data/enums/enums';
import { ProblemsModel } from '../../../../../data/models/problems.model';
import { CreateProblemDto, UpdateProblemDto } from '../../../../../data/dto/problems';

interface DifficultyOption {
  label: string;
  value: DifficultyEnum;
  severity: 'success' | 'warning' | 'danger';
}

@Component({
  selector: 'app-admin-problem-form-dialog',
  imports: [
    Button,
    InputText,
    Select,
    InputNumber,
    Checkbox,
    ReactiveFormsModule,
    TextEditorComponent,
  ],
  templateUrl: './problem-form-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminProblemFormDialogComponent {
  private fb = inject(FormBuilder);

  // Inputs
  readonly problem = input<ProblemsModel | null>(null);
  readonly loading = input<boolean>(false);

  // Outputs
  readonly save = output<CreateProblemDto | UpdateProblemDto>();
  readonly cancel = output<void>();

  // State
  form!: FormGroup;
  isEditMode = signal<boolean>(false);

  difficultyOptions: DifficultyOption[] = [
    { label: 'Easy', value: DifficultyEnum.Easy, severity: 'success' },
    { label: 'Medium', value: DifficultyEnum.Medium, severity: 'warning' },
    { label: 'Hard', value: DifficultyEnum.Hard, severity: 'danger' }
  ];

  constructor() {
    this.initForm();
    
    // Update form when problem changes
    effect(() => {
      const problemData = this.problem();
      if (problemData) {
        this.isEditMode.set(true);
        this.patchForm(problemData);
      } else {
        this.isEditMode.set(false);
        this.form.reset(this.getDefaultValues());
      }
    });
  }

  private initForm(): void {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      slug: ['', [Validators.pattern(/^[a-z0-9-]+$/)]],
      description: [''],
      inputDescription: [''],
      outputDescription: [''],
      timeLimitMs: [2000, [Validators.required, Validators.min(100), Validators.max(30000)]],
      memoryLimitMb: [256, [Validators.required, Validators.min(16), Validators.max(1024)]],
      difficulty: [DifficultyEnum.Easy, Validators.required],
      points: [100, [Validators.required, Validators.min(0), Validators.max(1000)]],
      isPublished: [false]
    });
  }

  private getDefaultValues() {
    return {
      title: '',
      slug: '',
      description: '',
      inputDescription: '',
      outputDescription: '',
      timeLimitMs: 2000,
      memoryLimitMb: 256,
      difficulty: DifficultyEnum.Easy,
      points: 100,
      isPublished: false
    };
  }

  private patchForm(problem: ProblemsModel): void {
    this.form.patchValue({
      title: problem.title,
      slug: problem.slug,
      description: problem.description || '',
      inputDescription: problem.inputDescription || '',
      outputDescription: problem.outputDescription || '',
      timeLimitMs: problem.timeLimitMs,
      memoryLimitMb: problem.memoryLimitMb,
      difficulty: problem.difficulty,
      points: problem.points,
      isPublished: problem.isPublished
    });
  }

  onCancel(): void {
    this.cancel.emit();
    this.form.reset(this.getDefaultValues());
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;
    this.save.emit(formValue);
  }

  getFieldError(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    const errors = control.errors;
    if (errors['required']) return `${fieldName} is required`;
    if (errors['minlength']) return `Minimum length is ${errors['minlength'].requiredLength}`;
    if (errors['maxlength']) return `Maximum length is ${errors['maxlength'].requiredLength}`;
    if (errors['min']) return `Minimum value is ${errors['min'].min}`;
    if (errors['max']) return `Maximum value is ${errors['max'].max}`;
    if (errors['pattern']) return 'Invalid format (use lowercase, numbers, and hyphens only)';
    
    return 'Invalid value';
  }

  getDifficultyClass(difficulty: DifficultyEnum): string {
    switch (difficulty) {
      case DifficultyEnum.Easy: return 'text-green-600';
      case DifficultyEnum.Medium: return 'text-yellow-600';
      case DifficultyEnum.Hard: return 'text-red-600';
      default: return '';
    }
  }
}
