import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProblemsService } from '../../problems/services/problems.service';
import { MarkdownViewComponent } from '../../../../shared/components/markdown-view/markdown-view.component';

@Component({
  selector: 'app-lecturergrading',
  imports: [FormsModule, InputText, Select, Toast, MarkdownViewComponent],
  providers: [MessageService],
  template: `
    <p-toast position="top-right" />
    <div class="max-w-7xl mx-auto space-y-4">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">AI Grading & Quality</h1>
        <p class="text-sm text-gray-500">Chấm AI, plagiarism check, sinh đề và sinh testcases.</p>
      </div>

      <div class="rounded-xl border border-gray-200 p-4 bg-white space-y-3">
        <h2 class="text-sm font-semibold text-gray-900">AI grading + plagiarism</h2>
        <div class="flex flex-wrap gap-2 items-center">
          <input pInputText [(ngModel)]="submissionId" placeholder="Submission ID" class="w-full md:w-80" />
          <button
            type="button"
            class="px-3 py-2 rounded-lg text-xs font-medium bg-blue-600 text-white disabled:opacity-50"
            (click)="gradeSubmission()"
            [disabled]="gradeLoading()"
          >
            {{ gradeLoading() ? 'Đang chấm...' : 'AI Grade' }}
          </button>
          <button
            type="button"
            class="px-3 py-2 rounded-lg text-xs font-medium border border-gray-300 text-gray-700 disabled:opacity-50"
            (click)="loadGrading()"
            [disabled]="gradingDetailLoading()"
          >
            {{ gradingDetailLoading() ? 'Đang tải...' : 'Lấy kết quả grade' }}
          </button>
          <button
            type="button"
            class="px-3 py-2 rounded-lg text-xs font-medium border border-amber-300 text-amber-700 disabled:opacity-50"
            (click)="runPlagiarism()"
            [disabled]="plagiarismLoading()"
          >
            {{ plagiarismLoading() ? 'Đang kiểm tra...' : 'Plagiarism Check' }}
          </button>
        </div>
      </div>

      @if (gradingResult()) {
        <div class="rounded-xl border border-gray-200 p-4 bg-white">
          <p class="text-xs text-gray-500 mb-1">Kết quả AI grading</p>
          <app-markdown-view [content]="gradingResult()" format="markdown" />
        </div>
      }

      @if (plagiarismResult()) {
        <div class="rounded-xl border border-gray-200 p-4 bg-white">
          <p class="text-xs text-gray-500 mb-1">Kết quả plagiarism</p>
          <app-markdown-view [content]="plagiarismResult()" format="markdown" />
        </div>
      }

      <div class="rounded-xl border border-gray-200 p-4 bg-white space-y-3">
        <h2 class="text-sm font-semibold text-gray-900">AI Problem Generator</h2>
        <div class="grid md:grid-cols-3 gap-2">
          <input pInputText [(ngModel)]="topic" placeholder="Topic (VD: Dynamic Programming)" />
          <p-select
            [ngModel]="difficulty"
            [options]="difficultyOptions"
            optionLabel="label"
            optionValue="value"
            (onChange)="difficulty = $event.value"
          />
          <input pInputText [(ngModel)]="constraints" placeholder="Constraints (optional)" />
        </div>
        <button
          type="button"
          class="px-3 py-2 rounded-lg text-xs font-medium bg-indigo-600 text-white disabled:opacity-50"
          (click)="generateProblemDraft()"
          [disabled]="problemGenLoading()"
        >
          {{ problemGenLoading() ? 'Đang sinh...' : 'Sinh đề bài' }}
        </button>
      </div>

      @if (generatedProblem()) {
        <div class="rounded-xl border border-gray-200 p-4 bg-white">
          <p class="text-xs text-gray-500 mb-1">Đề bài AI sinh</p>
          <app-markdown-view [content]="generatedProblem()" format="markdown" />
        </div>
      }

      <div class="rounded-xl border border-gray-200 p-4 bg-white space-y-3">
        <h2 class="text-sm font-semibold text-gray-900">AI Testcase Generator</h2>
        <div class="flex flex-wrap gap-2 items-center">
          <input pInputText [(ngModel)]="problemIdForTestcase" placeholder="Problem ID" class="w-full md:w-80" />
          <button
            type="button"
            class="px-3 py-2 rounded-lg text-xs font-medium bg-emerald-600 text-white disabled:opacity-50"
            (click)="generateTestcases()"
            [disabled]="testcaseLoading()"
          >
            {{ testcaseLoading() ? 'Đang sinh...' : 'Sinh testcases' }}
          </button>
        </div>
      </div>

      @if (generatedTestcases().length > 0) {
        <div class="rounded-xl border border-gray-200 p-4 bg-white">
          <p class="text-xs text-gray-500 mb-2">Testcases AI đã sinh ({{ generatedTestcases().length }})</p>
          <div class="space-y-2">
            @for (item of generatedTestcases(); track $index) {
              <div class="rounded-lg border border-gray-200 p-3">
                <p class="text-xs text-gray-500">Input</p>
                <pre class="text-xs bg-gray-50 p-2 rounded">{{ item.input || '-' }}</pre>
                <p class="text-xs text-gray-500 mt-2">Expected Output</p>
                <pre class="text-xs bg-gray-50 p-2 rounded">{{ item.expectedOutput || '-' }}</pre>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LecturerGradingComponent {
  private readonly problemsService = inject(ProblemsService);
  private readonly messageService = inject(MessageService);

  readonly difficultyOptions = [
    { label: 'Easy', value: 'easy' as const },
    { label: 'Medium', value: 'medium' as const },
    { label: 'Hard', value: 'hard' as const },
  ];

  submissionId = '';
  topic = '';
  constraints = '';
  difficulty: 'easy' | 'medium' | 'hard' = 'medium';
  problemIdForTestcase = '';

  readonly gradeLoading = signal(false);
  readonly gradingDetailLoading = signal(false);
  readonly plagiarismLoading = signal(false);
  readonly problemGenLoading = signal(false);
  readonly testcaseLoading = signal(false);

  readonly gradingResult = signal<string>('');
  readonly plagiarismResult = signal<string>('');
  readonly generatedProblem = signal<string>('');
  readonly generatedTestcases = signal<any[]>([]);

  gradeSubmission(): void {
    if (!this.submissionId.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Thiếu dữ liệu', detail: 'Vui lòng nhập Submission ID.' });
      return;
    }
    this.gradeLoading.set(true);
    this.problemsService.gradeSubmissionAi(this.submissionId.trim()).subscribe({
      next: (response) => {
        this.gradingResult.set(this.toMarkdown(response.data));
        this.gradeLoading.set(false);
      },
      error: () => {
        this.gradeLoading.set(false);
      },
    });
  }

  loadGrading(): void {
    if (!this.submissionId.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Thiếu dữ liệu', detail: 'Vui lòng nhập Submission ID.' });
      return;
    }
    this.gradingDetailLoading.set(true);
    this.problemsService.getSubmissionAiGrading(this.submissionId.trim()).subscribe({
      next: (response) => {
        this.gradingResult.set(this.toMarkdown(response.data));
        this.gradingDetailLoading.set(false);
      },
      error: () => {
        this.gradingDetailLoading.set(false);
      },
    });
  }

  runPlagiarism(): void {
    if (!this.submissionId.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Thiếu dữ liệu', detail: 'Vui lòng nhập Submission ID.' });
      return;
    }
    this.plagiarismLoading.set(true);
    this.problemsService.runPlagiarismCheck(this.submissionId.trim(), 0.75).subscribe({
      next: (response) => {
        this.plagiarismResult.set(this.toMarkdown(response.data));
        this.plagiarismLoading.set(false);
      },
      error: () => {
        this.plagiarismLoading.set(false);
      },
    });
  }

  generateProblemDraft(): void {
    if (!this.topic.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Thiếu dữ liệu', detail: 'Vui lòng nhập topic.' });
      return;
    }
    this.problemGenLoading.set(true);
    this.problemsService
      .generateProblemDraftAi(this.topic.trim(), this.difficulty, this.constraints || undefined, 'vi')
      .subscribe({
        next: (response) => {
          this.generatedProblem.set(this.toMarkdown(response.data));
          this.problemGenLoading.set(false);
        },
        error: () => {
          this.problemGenLoading.set(false);
        },
      });
  }

  generateTestcases(): void {
    if (!this.problemIdForTestcase.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Thiếu dữ liệu', detail: 'Vui lòng nhập Problem ID.' });
      return;
    }
    this.testcaseLoading.set(true);
    this.problemsService
      .generateAiTestcases(this.problemIdForTestcase.trim(), {
        includeCornerCases: true,
        includeEdgeCases: true,
        includePerformance: true,
        count: 8,
      })
      .subscribe({
        next: (response) => {
          this.generatedTestcases.set(response.data || []);
          this.testcaseLoading.set(false);
        },
        error: () => {
          this.testcaseLoading.set(false);
        },
      });
  }

  private toMarkdown(value: unknown): string {
    return `\`\`\`json\n${JSON.stringify(value ?? {}, null, 2)}\n\`\`\``;
  }
}
