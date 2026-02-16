import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  signal,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// PrimeNG
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Components
import { CodeEditorComponent } from '../components/code-editor/code-editor.component';
import { SubmissionResultComponent } from '../components/submission-result/submission-result.component';

// Services & Models
import { ProblemsService } from '../services/problems.service';
import { SubmissionsService } from '../services/submissions.service';
import { ProblemsModel } from '../../../data/models/problems.model';
import { TestcasesModel } from '../../../data/models/testcases.model';
import { HintsModel } from '../../../data/models/hints.model';
import { SubmissionsModel } from '../../../data/models/submissions.model';
import { DifficultyEnum, ProgrammingLanguageEnum } from '../../../data/enums/enums';

@Component({
  selector: 'app-problem-detail',
  imports: [
    CommonModule,
    Toast,
    CodeEditorComponent,
    SubmissionResultComponent,
  ],
  providers: [MessageService],
  templateUrl: './problem-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProblemDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly problemsService = inject(ProblemsService);
  private readonly submissionsService = inject(SubmissionsService);
  private readonly messageService = inject(MessageService);

  @ViewChild(CodeEditorComponent) codeEditor!: CodeEditorComponent;

  // State
  readonly problem = signal<ProblemsModel | null>(null);
  readonly sampleTestcases = signal<TestcasesModel[]>([]);
  readonly hints = signal<HintsModel[]>([]);
  readonly submissionHistory = signal<SubmissionsModel[]>([]);
  readonly loading = signal<boolean>(true);
  readonly currentSubmission = signal<SubmissionsModel | null>(null);
  readonly isSubmitting = signal<boolean>(false);

  // UI State
  readonly visibleHints = signal<Set<number>>(new Set());
  readonly activeTabIndex = signal<number>(0);

  ngOnInit(): void {
    const problemId = this.route.snapshot.paramMap.get('id');
    if (problemId) {
      this.loadProblem(problemId);
      this.loadTestcases(problemId);
      this.loadHints(problemId);
      this.loadSubmissionHistory(problemId);
    }
  }

  /**
   * Load problem details
   */
  private loadProblem(problemId: string): void {
    this.loading.set(true);
    this.problemsService.getProblemById(problemId).subscribe({
      next: (response) => {
        console.log('Problem response:', response);
        console.log('Problem data:', response.data);
        this.problem.set(response.data || null);
        console.log('Problem signal value:', this.problem());
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading problem:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể tải bài tập',
        });
        this.loading.set(false);
      },
    });
  }

  /**
   * Load testcases
   */
  private loadTestcases(problemId: string): void {
    this.problemsService.getSampleTestcases(problemId).subscribe({
      next: (response) => {
        // Only show sample testcases
        this.sampleTestcases.set(
          (response.data || []).filter((tc) => tc.isSample)
        );
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể tải testcases',
        });
      },
    });
  }

  /**
   * Load hints
   */
  private loadHints(problemId: string): void {
    this.problemsService.getHints(problemId).subscribe({
      next: (response) => {
        // Only show public hints, sorted by hintOrder
        const publicHints = (response.data || [])
          .filter((h) => h.isPublic)
          .sort((a, b) => a.hintOrder - b.hintOrder);
        this.hints.set(publicHints);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể tải gợi ý',
        });
      },
    });
  }

  /**
   * Load submission history
   */
  private loadSubmissionHistory(problemId: string): void {
    this.problemsService.getSubmissionHistory(problemId).subscribe({
      next: (response) => {
        this.submissionHistory.set(response.data || []);
      },
      error: () => {
        // Silent fail for submission history
      },
    });
  }

  /**
   * Submit solution
   */
  onSubmit(): void {
    const problem = this.problem();
    if (!problem || !this.codeEditor) return;

    const code = this.codeEditor.getCode();
    const language = this.codeEditor.getLanguage();

    if (!code.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: 'Vui lòng nhập code trước khi submit',
      });
      return;
    }

    this.isSubmitting.set(true);
    this.submissionsService.setSubmitting(true);

    this.problemsService
      .submitSolution(problem.id.toString(), { code, language })
      .subscribe({
        next: (response) => {
          const submission = response.data || null;
          this.currentSubmission.set(submission);
          this.submissionsService.setCurrentSubmission(submission);
          this.isSubmitting.set(false);
          this.submissionsService.setSubmitting(false);

          this.messageService.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Đã submit bài thành công',
          });

          // Switch to result tab (if needed)
          this.activeTabIndex.set(0);

          // Reload submission history
          this.loadSubmissionHistory(problem.id.toString());

          // Poll for result if pending/running
          if (submission) {
            this.pollSubmissionResult(submission.id.toString());
          }
        },
        error: () => {
          this.isSubmitting.set(false);
          this.submissionsService.setSubmitting(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không thể submit bài',
          });
        },
      });
  }

  /**
   * Poll submission result (simplified - in production use WebSocket)
   */
  private pollSubmissionResult(submissionId: string): void {
    // TODO: Implement polling or WebSocket for real-time updates
    // For now, we'll just show the initial result
  }

  /**
   * Toggle hint visibility
   */
  toggleHint(hintId: number): void {
    const visible = this.visibleHints();
    const newVisible = new Set(visible);

    if (newVisible.has(hintId)) {
      newVisible.delete(hintId);
    } else {
      newVisible.add(hintId);
    }

    this.visibleHints.set(newVisible);
  }

  /**
   * Check if hint is visible
   */
  isHintVisible(hintId: number): boolean {
    return this.visibleHints().has(hintId);
  }

  /**
   * Render markdown to HTML
   */
  renderMarkdown(markdown: string | null): SafeHtml {
    if (!markdown) return '';
    const html = marked.parse(markdown) as string;
    const clean = DOMPurify.sanitize(html);
    return this.sanitizer.sanitize(1, clean) || '';
  }

  /**
   * Get difficulty badge severity
   */
  getDifficultySeverity(
    difficulty: DifficultyEnum
  ): 'success' | 'warn' | 'danger' {
    switch (difficulty) {
      case DifficultyEnum.Easy:
        return 'success';
      case DifficultyEnum.Medium:
        return 'warn';
      case DifficultyEnum.Hard:
        return 'danger';
      default:
        return 'success';
    }
  }

  /**
   * Get difficulty label
   */
  getDifficultyLabel(difficulty: DifficultyEnum): string {
    const labels: Record<DifficultyEnum, string> = {
      [DifficultyEnum.Easy]: 'Dễ',
      [DifficultyEnum.Medium]: 'Trung Bình',
      [DifficultyEnum.Hard]: 'Khó',
    };
    return labels[difficulty];
  }

  /**
   * Back to problems list
   */
  goBack(): void {
    this.router.navigate(['/problems']);
  }
}
