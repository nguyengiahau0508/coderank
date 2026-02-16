import {
  Component,
  ChangeDetectionStrategy,
  signal,
  forwardRef,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Editor, EditorTextChangeEvent } from 'primeng/editor';

@Component({
  selector: 'app-admin-text-editor',
  imports: [FormsModule, Editor],
  templateUrl: './text-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AdminTextEditorComponent),
      multi: true,
    },
  ],
  host: {
    class: 'block',
  },
})
export class AdminTextEditorComponent implements ControlValueAccessor {
  // State
  readonly content = signal<string>('');
  readonly disabled = signal(false);

  // CVA
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  // ControlValueAccessor
  writeValue(value: string): void {
    this.content.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onTextChange(event: EditorTextChangeEvent): void {
    const html = event.htmlValue ?? '';
    this.content.set(html);
    this.onChange(html);
  }

  onBlur(): void {
    this.onTouched();
  }
}
