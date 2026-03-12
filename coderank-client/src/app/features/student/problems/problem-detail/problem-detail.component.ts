import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  signal,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

// PrimeNG
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Components
import { CodeEditorComponent } from '../../../../shared/components/code-editor/code-editor.component';
import { StudentSubmissionResultComponent } from '../components/submission-result/submission-result.component';
import { MarkdownViewComponent } from '../../../../shared/components/markdown-view/markdown-view.component';
import { StudentSolutionListComponent } from '../components/solution-list/solution-list.component';
import { StudentSolutionFormDialogComponent } from '../components/solution-form-dialog/solution-form-dialog.component';

// Services & Models
import { ProblemsService } from '../services/problems.service';
import { TestcasesService } from '../services/testcases.service';
import { HintsService } from '../services/hints.service';
import { SubmissionsService } from '../services/submissions.service';
import { SolutionsService } from '../services/solutions.service';
import { ProblemsModel } from '../../../../data';
import { TestcasesModel } from '../../../../data';
import { HintsModel } from '../../../../data';
import { SubmissionsModel } from '../../../../data';
import { SolutionsModel } from '../../../../data';
import { DifficultyEnum, ProgrammingLanguageEnum, SubmissionStatusEnum } from '../../../../data';

@Component({
  selector: 'app-student-problem-detail',
  imports: [
    CommonModule,
    Toast,
    CodeEditorComponent,
    StudentSubmissionResultComponent,
    MarkdownViewComponent,
    StudentSolutionListComponent,
    StudentSolutionFormDialogComponent,
  ],
  providers: [MessageService],
  templateUrl: './problem-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentProblemDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly problemsService = inject(ProblemsService);
  private readonly testcasesService = inject(TestcasesService);
  private readonly hintsService = inject(HintsService);
  private readonly submissionsService = inject(SubmissionsService);
  private readonly solutionsService = inject(SolutionsService);
  private readonly messageService = inject(MessageService);

  // State
  readonly problem = signal<ProblemsModel | null>(null);
  readonly sampleTestcases = signal<TestcasesModel[]>([]);
  readonly hints = signal<HintsModel[]>([]);
  readonly submissionHistory = signal<SubmissionsModel[]>([]);
  readonly solutions = signal<SolutionsModel[]>([]);
  readonly mySolutions = signal<SolutionsModel[]>([]);
  readonly loading = signal<boolean>(true);
  readonly currentSubmission = signal<SubmissionsModel | null>(null);
  readonly isSubmitting = signal<boolean>(false);
  readonly hasAccepted = signal<boolean>(false);
  readonly showSolutionForm = signal<boolean>(false);
  readonly solutionsLoading = signal<boolean>(false);
  readonly mySolutionsLoading = signal<boolean>(false);
  readonly editingSolution = signal<SolutionsModel | null>(null);
  readonly selectedSubmission = signal<SubmissionsModel | null>(null);

  // Code editor state
  readonly currentCode = signal<string>('');
  readonly currentLanguage = signal<ProgrammingLanguageEnum>(ProgrammingLanguageEnum.Python);

  // UI State
  readonly visibleHints = signal<Set<number>>(new Set());
  readonly activeTabIndex = signal<number>(0);

  readonly tabs = [
    { label: 'Đề bài', index: 0 },
    { label: 'Ví dụ', index: 1 },
    { label: 'Gợi ý', index: 2 },
    { label: 'Lịch sử', index: 3 },
    { label: 'Solutions', index: 4 },
  ];

  ngOnInit(): void {
    const problemId = this.route.snapshot.paramMap.get('id');
    if (problemId) {
      this.loadProblem(problemId);
      this.loadTestcases(problemId);
      this.loadHints(problemId);
      this.loadSubmissionHistory(problemId);
      this.loadSolutions(problemId);
      this.loadMySolutions(problemId);
    }
  }

  /**
   * Load problem details
   */
  private loadProblem(problemId: string): void {
    this.loading.set(true);
    this.problemsService.getProblem(problemId).subscribe({
      next: (response) => {
        this.problem.set(response.data || null);
        this.loading.set(false);
      },
      error: () => {
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
    this.testcasesService.getSampleTestcases(problemId).subscribe({
      next: (response) => {
        this.sampleTestcases.set(
          (response.data || []).filter((tc: any) => tc.isSample)
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
    this.hintsService.getHints(problemId).subscribe({
      next: (response) => {
        const publicHints = (response.data || [])
          .filter((h: any) => h.isPublic)
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
    this.submissionsService.getSubmissions(problemId).subscribe({
      next: (response) => {
        const history = response.data || [];
        this.submissionHistory.set(history);
        const accepted = history.some(
          (s) => s.status === SubmissionStatusEnum.Accepted
        );
        this.hasAccepted.set(accepted);
      },
      error: () => {
        // Silent fail for submission history
      },
    });
  }

  /**
   * View submission detail
   */
  viewSubmissionDetail(submission: SubmissionsModel): void {
    this.selectedSubmission.set(submission);
  }

  /**
   * Back to submission list
   */
  backToSubmissionList(): void {
    this.selectedSubmission.set(null);
  }

  /**
   * Get language label
   */
  getLanguageLabel(lang: string): string {
    const labels: Record<string, string> = {
      python: 'Python',
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      java: 'Java',
      cpp: 'C++',
      c: 'C',
      go: 'Go',
      rust: 'Rust',
    };
    return labels[lang] || lang;
  }

  /**
   * Get status label
   */
  getStatusLabel(status: SubmissionStatusEnum): string {
    return this.submissionsService.getStatusLabel(status);
  }

  /**
   * Get success rate percentage
   */
  getSuccessRate(sub: SubmissionsModel): number {
    if (sub.totalTestcases === 0) return 0;
    return Math.round((sub.passedTestcases / sub.totalTestcases) * 100);
  }

  /**
   * Load solutions for the problem
   */
  private loadSolutions(problemId: string): void {
    this.solutionsLoading.set(true);
    this.solutionsService.getSolutions(problemId).subscribe({
      next: (response) => {
        this.solutions.set(response.data || []);
        this.solutionsLoading.set(false);
      },
      error: () => {
        this.solutionsLoading.set(false);
      },
    });
  }

  /**
   * Load my solutions for the problem
   */
  private loadMySolutions(problemId: string): void {
    this.mySolutionsLoading.set(true);
    this.solutionsService.getMySolutions(problemId).subscribe({
      next: (response) => {
        this.mySolutions.set(response.data || []);
        this.mySolutionsLoading.set(false);
      },
      error: () => {
        this.mySolutionsLoading.set(false);
      },
    });
  }

  /**
   * Open solution form dialog
   */
  openSolutionForm(): void {
    this.editingSolution.set(null);
    this.showSolutionForm.set(true);
  }

  /**
   * Open solution form dialog in edit mode
   */
  onEditSolution(solution: SolutionsModel): void {
    this.editingSolution.set(solution);
    this.showSolutionForm.set(true);
  }

  /**
   * Delete a solution
   */
  onDeleteSolution(solution: SolutionsModel): void {
    const problemId = this.problem()?.id?.toString();
    if (!problemId) return;

    if (!confirm('Bạn có chắc muốn xóa solution này?')) return;

    this.solutionsService.deleteSolution(problemId, solution.id.toString()).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Đã xóa solution thành công!',
        });
        this.loadMySolutions(problemId);
        this.loadSolutions(problemId);
      },
      error: (err) => {
        const message = err?.error?.message || 'Không thể xóa solution.';
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: message,
        });
      },
    });
  }

  /**
   * Handle solution created event
   */
  onSolutionCreated(): void {
    const problemId = this.problem()?.id?.toString();
    if (problemId) {
      this.loadSolutions(problemId);
      this.loadMySolutions(problemId);
    }
  }

  /**
   * Handle solution updated event
   */
  onSolutionUpdated(): void {
    const problemId = this.problem()?.id?.toString();
    if (problemId) {
      this.loadSolutions(problemId);
      this.loadMySolutions(problemId);
    }
  }

  /**
   * Handle code change from editor
   */
  onCodeChange(code: string): void {
    this.currentCode.set(code);
  }

  /**
   * Handle language change from editor
   */
  onLanguageChange(language: ProgrammingLanguageEnum): void {
    this.currentLanguage.set(language);
  }

  /**
   * Submit solution
   */
  onSubmit(): void {
    const problem = this.problem();
    if (!problem) return;

    const code = this.currentCode();
    const language = this.currentLanguage();

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

    this.submissionsService
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

          // Switch to result tab
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
   * Poll submission result
   */
  private pollSubmissionResult(submissionId: string): void {
    // TODO: Implement polling or WebSocket for real-time updates
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
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  /**
   * Copy text to clipboard
   */
  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Đã sao chép',
        life: 1500,
      });
    });
  }
}
