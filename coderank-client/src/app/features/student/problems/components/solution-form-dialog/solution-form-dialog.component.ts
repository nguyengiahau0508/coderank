import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  inject,
  effect,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { Editor, EditorTextChangeEvent } from 'primeng/editor';
import { MessageService } from 'primeng/api';
import { SolutionsService } from '../../services/solutions.service';
import { SolutionsModel } from '../../../../../data/models/solutions.model';
import { ProgrammingLanguageEnum } from '../../../../../data/enums/enums';

interface LanguageOption {
  label: string;
  value: ProgrammingLanguageEnum;
}

@Component({
  selector: 'app-student-solution-form-dialog',
  imports: [FormsModule, Dialog, Button, Select, InputText, Editor],
  templateUrl: './solution-form-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentSolutionFormDialogComponent {
  private readonly solutionsService = inject(SolutionsService);
  private readonly messageService = inject(MessageService);

  readonly problemId = input.required<string>();
  readonly visible = input<boolean>(false);
  readonly editingSolution = input<SolutionsModel | null>(null);

  readonly visibleChange = output<boolean>();
  readonly solutionCreated = output<void>();
  readonly solutionUpdated = output<void>();

  // Form state
  readonly title = signal('');
  readonly description = signal('');
  readonly code = signal('');
  readonly language = signal<ProgrammingLanguageEnum>(ProgrammingLanguageEnum.Python);
  readonly isSubmitting = signal(false);

  readonly languageOptions: LanguageOption[] = [
    { label: 'Python', value: ProgrammingLanguageEnum.Python },
    { label: 'JavaScript', value: ProgrammingLanguageEnum.JavaScript },
    { label: 'TypeScript', value: ProgrammingLanguageEnum.TypeScript },
    { label: 'Java', value: ProgrammingLanguageEnum.Java },
    { label: 'C++', value: ProgrammingLanguageEnum.CPlusPlus },
    { label: 'C', value: ProgrammingLanguageEnum.C },
    { label: 'Go', value: ProgrammingLanguageEnum.Go },
    { label: 'Rust', value: ProgrammingLanguageEnum.Rust },
  ];

  constructor() {
    // Populate form when editing
    effect(() => {
      const solution = this.editingSolution();
      if (solution) {
        this.title.set(solution.title);
        this.description.set(solution.description);
        this.code.set(solution.code);
        this.language.set(solution.language);
      }
    });
  }

  get isEditMode(): boolean {
    return !!this.editingSolution();
  }

  get dialogHeader(): string {
    return this.isEditMode ? 'Chỉnh sửa Solution' : 'Chia sẻ Solution';
  }

  onHide(): void {
    this.visibleChange.emit(false);
    this.resetForm();
  }

  onDescriptionChange(event: EditorTextChangeEvent): void {
    this.description.set(event.htmlValue ?? '');
  }

  submit(): void {
    const title = this.title().trim();
    const description = this.description().trim();
    const code = this.code().trim();

    if (!title || !description || !code) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Thiếu thông tin',
        detail: 'Vui lòng điền đầy đủ tiêu đề, mô tả và code',
      });
      return;
    }

    this.isSubmitting.set(true);

    const dto = { title, description, code, language: this.language() };
    const solution = this.editingSolution();

    if (solution) {
      // Update mode
      this.solutionsService
        .updateSolution(this.problemId(), solution.id.toString(), dto)
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Thành công',
              detail: 'Đã cập nhật solution thành công!',
            });
            this.isSubmitting.set(false);
            this.solutionUpdated.emit();
            this.onHide();
          },
          error: (err) => {
            this.isSubmitting.set(false);
            const message = err?.error?.message || 'Không thể cập nhật solution.';
            this.messageService.add({
              severity: 'error',
              summary: 'Lỗi',
              detail: message,
            });
          },
        });
    } else {
      // Create mode
      this.solutionsService
        .createSolution(this.problemId(), dto)
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Thành công',
              detail: 'Đã chia sẻ solution thành công!',
            });
            this.isSubmitting.set(false);
            this.solutionCreated.emit();
            this.onHide();
          },
          error: (err) => {
            this.isSubmitting.set(false);
            const message =
              err?.error?.message ||
              'Không thể chia sẻ solution. Bạn cần giải thành công bài này trước.';
            this.messageService.add({
              severity: 'error',
              summary: 'Lỗi',
              detail: message,
            });
          },
        });
    }
  }

  private resetForm(): void {
    this.title.set('');
    this.description.set('');
    this.code.set('');
    this.language.set(ProgrammingLanguageEnum.Python);
  }
}
