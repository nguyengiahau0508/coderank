import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  signal,
  inject,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// PrimeNG
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Components
import { CodeEditorComponent } from '../../../../shared/components/code-editor/code-editor.component';
import { AdminSubmissionResultComponent } from '../components/submission-result/submission-result.component';
import { MarkdownViewComponent } from '../../../../shared/components/markdown-view/markdown-view.component';
import { AdminSolutionListComponent } from '../components/solution-list/solution-list.component';
import { AdminSolutionFormDialogComponent } from '../components/solution-form-dialog/solution-form-dialog.component';

// Services & Models
import { ProblemsService } from '../../../../shared/services/problems/problems.service';
import { TestcasesService } from '../../../../shared/services/problems/testcases.service';
import { HintsService } from '../../../../shared/services/problems/hints.service';
import { SubmissionsService } from '../../../../shared/services/problems/submissions.service';
import { SolutionsService } from '../../../../shared/services/problems/solutions.service';
import { RunnerApi, RunResult, RunStatusEnum } from '../../../../data';
import { ProblemsModel } from '../../../../data';
import { TestcasesModel } from '../../../../data';
import { HintsModel } from '../../../../data';
import { SubmissionsModel } from '../../../../data';
import { SolutionsModel } from '../../../../data';
import { DifficultyEnum, ProgrammingLanguageEnum, SubmissionStatusEnum } from '../../../../data';
import { Subscription } from 'rxjs';
import {
  SubmissionCompletedSocketPayload,
  SubmissionSocket,
} from '../../../../data';

export interface CustomTestcase {
  id: number;
  input: string;
  expectedOutput: string;
}

@Component({
  selector: 'app-admin-problem-detail',
  imports: [
    CommonModule,
    FormsModule,
    Toast,
    CodeEditorComponent,
    AdminSubmissionResultComponent,
    MarkdownViewComponent,
    AdminSolutionListComponent,
    AdminSolutionFormDialogComponent,
  ],
  providers: [MessageService],
  templateUrl: './problem-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProblemDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly problemsService = inject(ProblemsService);
  private readonly testcasesService = inject(TestcasesService);
  private readonly hintsService = inject(HintsService);
  private readonly submissionsService = inject(SubmissionsService);
  private readonly solutionsService = inject(SolutionsService);
  private readonly runnerApi = inject(RunnerApi);
  private readonly messageService = inject(MessageService);
  private readonly submissionSocketApi = inject(SubmissionSocket);
  private submissionCompletedSubscription?: Subscription;

  // State
  readonly problem = signal<ProblemsModel | null>(null);
  readonly allTestcases = signal<TestcasesModel[]>([]);
  readonly sampleTestcases = computed(() => this.allTestcases().filter(tc => tc.isSample));
  readonly hiddenTestcases = computed(() => this.allTestcases().filter(tc => !tc.isSample));
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
  readonly selectedSubmissionLoading = signal<boolean>(false);

  // Code editor state
  readonly currentCode = signal<string>('');
  readonly currentLanguage = signal<ProgrammingLanguageEnum>(ProgrammingLanguageEnum.Python);

  // Run code state
  readonly isRunning = signal<boolean>(false);
  readonly runResults = signal<{ testcase: CustomTestcase; result: RunResult | null; running: boolean }[]>([]);
  readonly runPassedCount = computed(() =>
    this.runResults().filter(r => r.result?.status === RunStatusEnum.OK && r.result?.stdout?.trim() === r.testcase.expectedOutput.trim()).length
  );
  readonly runAllPassed = computed(() =>
    this.runResults().length > 0 && this.runPassedCount() === this.runResults().length
  );

  // Custom testcases for run
  readonly customTestcases = signal<CustomTestcase[]>([]);
  private nextCustomId = 1;

  // Editor panel tabs
  readonly editorTabIndex = signal<number>(0); // 0 = Code Editor, 1 = Chạy thử

  // UI State
  readonly visibleHints = signal<Set<number>>(new Set());
  readonly activeTabIndex = signal<number>(0);

  // Computed stats
  readonly acceptedCount = computed(() =>
    this.submissionHistory().filter(s => s.status === SubmissionStatusEnum.Accepted).length
  );
  readonly acceptanceRate = computed(() => {
    const total = this.submissionHistory().length;
    if (total === 0) return 0;
    return Math.round((this.acceptedCount() / total) * 100);
  });

  readonly tabs = [
    { label: 'Đề bài', icon: 'pi-file-edit', index: 0 },
    { label: 'Test Cases', icon: 'pi-list-check', index: 1 },
    { label: 'Gợi ý', icon: 'pi-lightbulb', index: 2 },
    { label: 'Submissions', icon: 'pi-history', index: 3 },
    { label: 'Solutions', icon: 'pi-code', index: 4 },
  ];

  ngOnInit(): void {
    this.setupSubmissionSocket();

    const problemId = this.route.snapshot.paramMap.get('id');
    if (problemId) {
      this.loadProblem(problemId);
      this.loadAllTestcases(problemId);
      this.loadAllHints(problemId);
      this.loadSubmissionHistory(problemId);
      this.loadSolutions(problemId);
      this.loadMySolutions(problemId);
    }
  }

  ngOnDestroy(): void {
    this.disconnectSubmissionSocket();
  }

  private setupSubmissionSocket(): void {
    this.submissionSocketApi.connect();
    this.submissionCompletedSubscription = this.submissionSocketApi
      .onSubmissionCompleted()
      .subscribe((payload) => this.handleSubmissionCompleted(payload));
  }

  private disconnectSubmissionSocket(): void {
    this.submissionCompletedSubscription?.unsubscribe();
    this.submissionCompletedSubscription = undefined;
    this.submissionSocketApi.disconnect();
  }

  private handleSubmissionCompleted(payload: SubmissionCompletedSocketPayload): void {
    const current = this.currentSubmission();
    if (!current || current.id.toString() !== String(payload?.submissionId)) return;

    const updatedSubmission: SubmissionsModel = {
      ...current,
      status: payload.status,
      score: payload.score,
      passedTestcases: payload.passedTestcases,
      totalTestcases: payload.totalTestcases,
      executionTimeMs: payload.executionTimeMs,
      memoryUsageMb: payload.memoryUsedMb,
      errorMessage: payload.errorMessage ?? null,
      output: payload.output ?? null,
    };

    this.currentSubmission.set(updatedSubmission);
    this.submissionsService.setCurrentSubmission(updatedSubmission);

    const selected = this.selectedSubmission();
    if (selected && selected.id.toString() === String(payload.submissionId)) {
      this.selectedSubmission.set(updatedSubmission);
    }

    const problemId = this.problem()?.id?.toString();
    if (problemId) {
      this.loadSubmissionHistory(problemId);
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
   * Load ALL testcases (admin sees everything)
   */
  private loadAllTestcases(problemId: string): void {
    this.testcasesService.getTestcases(problemId).subscribe({
      next: (response) => {
        const testcases = (response.data || []).sort(
          (a, b) => a.testcaseOrder - b.testcaseOrder
        );
        this.allTestcases.set(testcases);
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
   * Load ALL hints (admin sees public + private)
   */
  private loadAllHints(problemId: string): void {
    this.hintsService.getHints(problemId).subscribe({
      next: (response) => {
        const allHints = (response.data || []).sort(
          (a, b) => a.hintOrder - b.hintOrder
        );
        this.hints.set(allHints);
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
        // Kiểm tra user đã có submission Accepted chưa
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
    // Results are pushed by websocket via submission:completed event.
  }

  /**
   * Run code against sample test cases
   */
  onRunCode(): void {
    const problem = this.problem();
    if (!problem) return;

    const code = this.currentCode();
    const language = this.currentLanguage();

    if (!code.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: 'Vui lòng nhập code trước khi chạy thử',
      });
      return;
    }

    // Merge sample testcases + custom testcases
    const samples: CustomTestcase[] = this.sampleTestcases().map(tc => ({
      id: tc.id,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
    }));
    const custom = this.customTestcases();
    const allTests = [...samples, ...custom];

    if (allTests.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: 'Không có test case nào để chạy thử',
      });
      return;
    }

    this.isRunning.set(true);
    this.editorTabIndex.set(1);
    this.runResults.set(
      allTests.map(tc => ({ testcase: tc, result: null, running: true }))
    );

    let completed = 0;
    for (let i = 0; i < allTests.length; i++) {
      const tc = allTests[i];
      this.runnerApi
        .runCode({
          code,
          language,
          input: tc.input,
          timeLimit: problem.timeLimitMs,
          memoryLimit: problem.memoryLimitMb,
        })
        .subscribe({
          next: (response) => {
            this.runResults.update(results => {
              const updated = [...results];
              updated[i] = { testcase: tc, result: response.data ?? null, running: false };
              return updated;
            });
            completed++;
            if (completed === allTests.length) {
              this.isRunning.set(false);
            }
          },
          error: () => {
            this.runResults.update(results => {
              const updated = [...results];
              updated[i] = {
                testcase: tc,
                result: { status: RunStatusEnum.RE, stdout: '', stderr: 'Lỗi kết nối server', time: 0, memory: 0 },
                running: false,
              };
              return updated;
            });
            completed++;
            if (completed === allTests.length) {
              this.isRunning.set(false);
            }
          },
        });
    }
  }

  /**
   * Add a custom testcase
   */
  addCustomTestcase(): void {
    this.customTestcases.update(list => [
      ...list,
      { id: this.nextCustomId++, input: '', expectedOutput: '' },
    ]);
  }

  /**
   * Remove a custom testcase
   */
  removeCustomTestcase(id: number): void {
    this.customTestcases.update(list => list.filter(tc => tc.id !== id));
  }

  /**
   * Update a custom testcase field
   */
  updateCustomTestcase(id: number, field: 'input' | 'expectedOutput', value: string): void {
    this.customTestcases.update(list =>
      list.map(tc => tc.id === id ? { ...tc, [field]: value } : tc)
    );
  }

  /**
   * Load sample testcases into custom testcases for editing
   */
  loadSampleTestcases(): void {
    const samples = this.sampleTestcases();
    this.customTestcases.set(
      samples.map(tc => ({
        id: this.nextCustomId++,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
      }))
    );
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
   * Navigate to edit problem page
   */
  editProblem(): void {
    const prob = this.problem();
    if (!prob) return;
    this.router.navigate(['../../edit', prob.id], { relativeTo: this.route });
  }

  /**
   * Get compare type label
   */
  getCompareTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      exact: 'Chính xác',
      trim_whitespace: 'Bỏ khoảng trắng',
      tokenize: 'Token hóa',
    };
    return labels[type] || type;
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
