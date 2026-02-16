import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  effect,
  signal,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule, NgxEditorModel } from 'ngx-monaco-editor-v2-alternative';
import { Select } from 'primeng/select';
import { ProgrammingLanguageEnum } from '../../../../data/enums/enums';

interface LanguageOption { label: string; value: ProgrammingLanguageEnum; monacoLang: string; template: string; } @Component({
  selector: 'app-code-editor',
  imports: [FormsModule, MonacoEditorModule, Select],
  templateUrl: './code-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeEditorComponent implements OnInit, OnDestroy {
  // Inputs
  readonly initialCode = input<string>('');
  readonly initialLanguage = input<ProgrammingLanguageEnum>(ProgrammingLanguageEnum.Python);
  readonly readOnly = input<boolean>(false);

  // Outputs
  readonly codeChange = output<string>();
  readonly languageChange = output<ProgrammingLanguageEnum>();

  // State
  readonly code = signal<string>('');
  readonly selectedLanguage = signal<ProgrammingLanguageEnum>(ProgrammingLanguageEnum.Python);

  // Monaco editor options
  readonly editorOptions = {
    language: 'python',
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    readOnly: false,
  };

  readonly editorModel = signal<NgxEditorModel>({
    value: '',
    language: 'python',
  });

  // Language options
  readonly languageOptions: LanguageOption[] = [
    {
      label: 'Python',
      value: ProgrammingLanguageEnum.Python,
      monacoLang: 'python',
      template: '# Write your Python code here\n\ndef solution():\n    pass\n\nif __name__ == "__main__":\n    solution()\n',
    },
    {
      label: 'JavaScript',
      value: ProgrammingLanguageEnum.JavaScript,
      monacoLang: 'javascript',
      template: '// Write your JavaScript code here\n\nfunction solution() {\n    // Your code here\n}\n\nsolution();\n',
    },
    {
      label: 'TypeScript',
      value: ProgrammingLanguageEnum.TypeScript,
      monacoLang: 'typescript',
      template: '// Write your TypeScript code here\n\nfunction solution(): void {\n    // Your code here\n}\n\nsolution();\n',
    },
    {
      label: 'Java',
      value: ProgrammingLanguageEnum.Java,
      monacoLang: 'java',
      template: 'public class Main {\n    public static void main(String[] args) {\n        // Write your Java code here\n        \n    }\n}\n',
    },
    {
      label: 'C++',
      value: ProgrammingLanguageEnum.CPlusPlus,
      monacoLang: 'cpp',
      template: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your C++ code here\n    \n    return 0;\n}\n',
    },
    {
      label: 'C',
      value: ProgrammingLanguageEnum.C,
      monacoLang: 'c',
      template: '#include <stdio.h>\n\nint main() {\n    // Write your C code here\n    \n    return 0;\n}\n',
    },
    {
      label: 'Go',
      value: ProgrammingLanguageEnum.Go,
      monacoLang: 'go',
      template: 'package main\n\nimport "fmt"\n\nfunc main() {\n    // Write your Go code here\n    \n}\n',
    },
    {
      label: 'Rust',
      value: ProgrammingLanguageEnum.Rust,
      monacoLang: 'rust',
      template: 'fn main() {\n    // Write your Rust code here\n    \n}\n',
    },
  ];

  constructor() {
    // Initialize with initial values
    effect(() => {
      const initial = this.initialCode();
      if (initial) {
        this.code.set(initial);
        this.updateEditorModel();
      }
    });

    effect(() => {
      const lang = this.initialLanguage();
      if (lang) {
        this.selectedLanguage.set(lang);
        this.updateEditorModel();
      }
    });

    effect(() => {
      this.editorOptions.readOnly = this.readOnly();
    });
  }

  ngOnInit(): void {
    // Load code from localStorage if exists
    const savedCode = this.getSavedCode();
    if (savedCode && !this.initialCode()) {
      this.code.set(savedCode);
    } else if (!this.code()) {
      // Set default template
      this.setDefaultTemplate();
    }

    this.updateEditorModel();
  }

  ngOnDestroy(): void {
    // Save code to localStorage before leaving
    if (!this.readOnly()) {
      this.saveCodeToLocalStorage();
    }
  }

  /**
   * Handle code change
   */
  onCodeChange(newCode: string): void {
    this.code.set(newCode);
    this.codeChange.emit(newCode);

    // Auto-save to localStorage
    if (!this.readOnly()) {
      this.saveCodeToLocalStorage();
    }
  }

  /**
   * Handle language change
   */
  onLanguageChange(): void {
    const selectedLang = this.selectedLanguage();
    this.languageChange.emit(selectedLang);

    // Ask user if they want to load template
    if (confirm('Bạn có muốn tải template mặc định cho ngôn ngữ này?')) {
      this.setDefaultTemplate();
    }

    this.updateEditorModel();
  }

  /**
   * Set default template for selected language
   */
  private setDefaultTemplate(): void {
    const lang = this.languageOptions.find(
      (l) => l.value === this.selectedLanguage()
    );
    if (lang) {
      this.code.set(lang.template);
      this.updateEditorModel();
    }
  }

  /**
   * Update editor model
   */
  private updateEditorModel(): void {
    const lang = this.languageOptions.find(
      (l) => l.value === this.selectedLanguage()
    );

    this.editorModel.set({
      value: this.code(),
      language: lang?.monacoLang || 'python',
    });
  }

  /**
   * Save code to localStorage
   */
  private saveCodeToLocalStorage(): void {
    const key = `code_editor_${this.selectedLanguage()}`;
    localStorage.setItem(key, this.code());
  }

  /**
   * Get saved code from localStorage
   */
  private getSavedCode(): string | null {
    const key = `code_editor_${this.selectedLanguage()}`;
    return localStorage.getItem(key);
  }

  /**
   * Clear editor
   */
  clearEditor(): void {
    if (confirm('Bạn có chắc muốn xóa toàn bộ code?')) {
      this.setDefaultTemplate();
    }
  }

  /**
   * Get current code
   */
  getCode(): string {
    return this.code();
  }

  /**
   * Get current language
   */
  getLanguage(): ProgrammingLanguageEnum {
    return this.selectedLanguage();
  }
}
