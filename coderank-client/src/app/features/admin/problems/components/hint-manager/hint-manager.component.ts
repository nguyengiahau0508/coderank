import { Component, ChangeDetectionStrategy, input, output, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Textarea } from 'primeng/textarea';
import { InputNumber } from 'primeng/inputnumber';
import { Checkbox } from 'primeng/checkbox';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { HintsModel } from '../../../../../data/models/hints.model';
import { CreateHintDto, UpdateHintDto } from '../../../../../data/dto/problems';

@Component({
  selector: 'app-admin-hint-manager',
  imports: [
    TableModule,
    Button,
    Dialog,
    Textarea,
    InputNumber,
    Checkbox,
    ConfirmDialog,
    ReactiveFormsModule
  ],
  providers: [ConfirmationService],
  templateUrl: './hint-manager.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminHintManagerComponent {
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);

  // Inputs
  readonly hints = input<HintsModel[]>([]);
  readonly loading = input<boolean>(false);

  // Outputs
  readonly create = output<CreateHintDto>();
  readonly update = output<{ id: string; dto: UpdateHintDto }>();
  readonly delete = output<string>();

  // State
  readonly showDialog = signal<boolean>(false);
  readonly editingHint = signal<HintsModel | null>(null);
  form!: FormGroup;

  constructor() {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(10)]],
      hintOrder: [1, [Validators.required, Validators.min(1)]],
      isPublic: [true]
    });
  }

  openCreateDialog(): void {
    this.editingHint.set(null);
    const nextOrder = this.hints().length + 1;
    this.form.reset({
      content: '',
      hintOrder: nextOrder,
      isPublic: true
    });
    this.showDialog.set(true);
  }

  openEditDialog(hint: HintsModel): void {
    this.editingHint.set(hint);
    this.form.patchValue({
      content: hint.content,
      hintOrder: hint.hintOrder,
      isPublic: hint.isPublic
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

    const formValue = this.form.value;
    const editing = this.editingHint();

    if (editing) {
      this.update.emit({ id: editing.id.toString(), dto: formValue });
    } else {
      this.create.emit(formValue);
    }

    this.closeDialog();
  }

  confirmDelete(hint: HintsModel): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this hint?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.delete.emit(hint.id.toString());
      }
    });
  }

  truncateText(text: string, maxLength: number = 100): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
}
