import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  computed,
  signal,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

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
import { RunnerApi, RunResult, RunStatusEnum } from '../../../../data';
import { ProblemsWorkspaceService, WorkspaceSplitMode } from '../services/problems-workspace.service';
import { ChatContextService } from '../../../../core/services/chat-context.service';
import { ProblemChatContext } from '../../../../core/models/chat-context.model';

interface WorkspaceCommand {
  id: string;
  label: string;
  shortcut: string;
  keywords: string[];
}
interface DetailTabItem {
  label: string;
  icon: string;
  index: number;
}

interface CustomTestcase {
  id: number;
  input: string;
  expectedOutput: string;
}

interface RunResultItem {
  testcase: CustomTestcase;
  result: RunResult | null;
  running: boolean;
}

@Component({
  selector: 'app-student-problem-detail',
  imports: [
    CommonModule,
    FormsModule,
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
  host: {
    '(window:keydown)': 'onGlobalKeydown($event)',
  },
})
export class StudentProblemDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly problemsService = inject(ProblemsService);
  private readonly testcasesService = inject(TestcasesService);
  private readonly hintsService = inject(HintsService);
  private readonly submissionsService = inject(SubmissionsService);
  private readonly solutionsService = inject(SolutionsService);
  private readonly messageService = inject(MessageService);
  private readonly workspaceService = inject(ProblemsWorkspaceService);
  private readonly runnerApi = inject(RunnerApi);
  private readonly chatContextService = inject(ChatContextService);

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
  readonly splitMode = signal<WorkspaceSplitMode>('50-50');
  readonly showLeftPanel = signal<boolean>(true);
  readonly showRightPanel = signal<boolean>(true);
  readonly showCommandPalette = signal<boolean>(false);
  readonly commandQuery = signal<string>('');

  // Code editor state
  readonly currentCode = signal<string>('');
  readonly currentLanguage = signal<ProgrammingLanguageEnum>(ProgrammingLanguageEnum.Python);

  // Run code state
  readonly isRunning = signal<boolean>(false);
  readonly runResults = signal<RunResultItem[]>([]);
  readonly editorTabIndex = signal<number>(0); // 0 = Code Editor, 1 = Chạy thử
  readonly customTestcases = signal<CustomTestcase[]>([]);
  private nextCustomId = 1;

  readonly runPassedCount = computed(() =>
    this.runResults().filter(r =>
      r.result?.status === RunStatusEnum.OK &&
      r.result?.stdout?.trim() === r.testcase.expectedOutput.trim()
    ).length
  );
  readonly runAllPassed = computed(() =>
    this.runResults().length > 0 && this.runPassedCount() === this.runResults().length
  );

  // UI State
  readonly visibleHints = signal<Set<number>>(new Set());
  readonly activeTabIndex = signal<number>(0);

  readonly tabs: DetailTabItem[] = [
    { label: 'Đề bài', icon: 'pi-file', index: 0 },
    { label: 'Ví dụ', icon: 'pi-list', index: 1 },
    { label: 'Gợi ý', icon: 'pi-lightbulb', index: 2 },
    { label: 'Lịch sử', icon: 'pi-history', index: 3 },
    { label: 'Solutions', icon: 'pi-code', index: 4 },
  ];
  readonly splitModes: WorkspaceSplitMode[] = ['40-60', '50-50', '60-40'];

  readonly splitGridClass = computed(() => {
    if (!this.showLeftPanel()) return 'grid-cols-1';
    if (!this.showRightPanel()) return 'grid-cols-1';

    if (this.splitMode() === '40-60') {
      return 'grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)]';
    }
    if (this.splitMode() === '60-40') {
      return 'grid-cols-[minmax(0,0.6fr)_minmax(0,0.4fr)]';
    }
    return 'grid-cols-2';
  });
  readonly commands: WorkspaceCommand[] = [
    { id: 'submit', label: 'Submit code', shortcut: 'Ctrl/Cmd + Enter', keywords: ['submit', 'nop bai', 'judge'] },
    { id: 'save-draft', label: 'Save draft', shortcut: 'Ctrl/Cmd + S', keywords: ['save', 'draft', 'luu'] },
    { id: 'run', label: 'Run placeholder', shortcut: '-', keywords: ['run', 'execute', 'test'] },
    { id: 'tab-statement', label: 'Go to Statement tab', shortcut: '1', keywords: ['statement', 'de bai', 'tab'] },
    { id: 'tab-examples', label: 'Go to Examples tab', shortcut: '2', keywords: ['example', 'vi du', 'tab'] },
    { id: 'tab-hints', label: 'Go to Hints tab', shortcut: '3', keywords: ['hint', 'goi y', 'tab'] },
    { id: 'toggle-left', label: 'Toggle left panel', shortcut: '-', keywords: ['left', 'panel', 'toggle'] },
    { id: 'toggle-right', label: 'Toggle editor panel', shortcut: '-', keywords: ['right', 'editor', 'panel', 'toggle'] },
    { id: 'split-50-50', label: 'Set split 50-50', shortcut: '-', keywords: ['split', '50', 'layout'] },
  ];
  readonly filteredCommands = computed(() => {
    const query = this.commandQuery().trim().toLowerCase();
    if (!query) return this.commands;
    return this.commands.filter(cmd =>
      cmd.label.toLowerCase().includes(query) ||
      cmd.keywords.some(keyword => keyword.includes(query))
    );
  });
  readonly acceptanceRate = computed(() => {
    const total = this.submissionHistory().length;
    if (total === 0) return 0;
    const accepted = this.submissionHistory().filter(
      item => item.status === SubmissionStatusEnum.Accepted
    ).length;
    return Math.round((accepted / total) * 100);
  });

  ngOnInit(): void {
    this.splitMode.set(this.workspaceService.preferences().splitMode);
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
        const problem = response.data || null;
        this.problem.set(problem);
        if (problem) {
          this.workspaceService.addRecent(problem.id, problem.title);
          const draft = this.workspaceService.getDraft(problem.id, this.currentLanguage());
          if (draft) {
            this.currentCode.set(draft);
          }
          // Set chat context for AI assistant
          this.updateChatContext(problem);
        }
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
   * Update chat context with current problem info
   */
  private updateChatContext(problem: ProblemsModel): void {
    const lastSubmission = this.submissionHistory()[0];
    const context: ProblemChatContext = {
      type: 'problem',
      problemId: problem.id,
      title: problem.title,
      difficulty: problem.difficulty,
      description: problem.description ?? undefined,
      tags: problem.tags?.map(t => t.name),
      userCode: this.currentCode() || undefined,
      lastSubmissionStatus: lastSubmission?.status,
    };
    this.chatContextService.pushContext(context);
  }

  ngOnDestroy(): void {
    // Clear chat context when leaving the problem
    this.chatContextService.popContext();
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
        if (accepted) {
          const problem = this.problem();
          if (problem) {
            this.workspaceService.markSolved(problem.id);
          }
        }
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
    const problem = this.problem();
    if (problem) {
      this.workspaceService.saveDraft(problem.id, this.currentLanguage(), code);
    }
  }

  /**
   * Handle language change from editor
   */
  onLanguageChange(language: ProgrammingLanguageEnum): void {
    this.currentLanguage.set(language);
    const problem = this.problem();
    if (!problem) return;

    const draft = this.workspaceService.getDraft(problem.id, language);
    if (draft) {
      this.currentCode.set(draft);
    }
  }

  saveDraft(): void {
    const problem = this.problem();
    if (!problem) return;

    this.workspaceService.saveDraft(problem.id, this.currentLanguage(), this.currentCode());
    this.messageService.add({
      severity: 'success',
      summary: 'Đã lưu draft',
      detail: 'Code hiện tại đã được lưu local.',
      life: 1400,
    });
  }

  async runCode(): Promise<void> {
    const code = this.currentCode();
    if (!code.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Không có code',
        detail: 'Vui lòng nhập code trước khi chạy thử.',
        life: 2000,
      });
      return;
    }

    const problem = this.problem();
    if (!problem) return;

    // Merge sample testcases with custom testcases
    const sampleTests: CustomTestcase[] = this.sampleTestcases().map((tc, idx) => ({
      id: -(idx + 1), // negative IDs for sample testcases
      input: tc.input,
      expectedOutput: tc.expectedOutput,
    }));
    const customTests = this.customTestcases();
    const allTestcases = [...sampleTests, ...customTests];

    if (allTestcases.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Không có test case',
        detail: 'Không có test case nào để chạy thử.',
        life: 2000,
      });
      return;
    }

    this.isRunning.set(true);
    this.editorTabIndex.set(1); // Switch to run results tab

    // Initialize run results
    const initialResults: RunResultItem[] = allTestcases.map(tc => ({
      testcase: tc,
      result: null,
      running: true,
    }));
    this.runResults.set(initialResults);

    // Run each testcase
    for (let i = 0; i < allTestcases.length; i++) {
      const tc = allTestcases[i];
      try {
        const response = await firstValueFrom(this.runnerApi.runCode({
          code,
          language: this.currentLanguage(),
          input: tc.input,
          timeLimit: problem.timeLimitMs,
          memoryLimit: problem.memoryLimitMb * 1024, // Convert MB to KB if needed
        }));

        this.runResults.update(results => {
          const updated = [...results];
          updated[i] = { ...updated[i], result: response.data ?? null, running: false };
          return updated;
        });
      } catch {
        this.runResults.update(results => {
          const updated = [...results];
          updated[i] = {
            ...updated[i],
            result: {
              status: RunStatusEnum.RE,
              stdout: '',
              stderr: 'Lỗi khi thực thi code',
              time: 0,
              memory: 0,
            },
            running: false,
          };
          return updated;
        });
      }
    }

    this.isRunning.set(false);

    // Show summary
    const passed = this.runPassedCount();
    const total = allTestcases.length;
    if (passed === total) {
      this.messageService.add({
        severity: 'success',
        summary: 'Tất cả test case đều pass!',
        detail: `${passed}/${total} test case pass`,
        life: 3000,
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Một số test case không pass',
        detail: `${passed}/${total} test case pass`,
        life: 3000,
      });
    }
  }

  addCustomTestcase(): void {
    this.customTestcases.update(tests => [
      ...tests,
      { id: this.nextCustomId++, input: '', expectedOutput: '' },
    ]);
  }

  removeCustomTestcase(id: number): void {
    this.customTestcases.update(tests => tests.filter(t => t.id !== id));
  }

  updateCustomTestcase(id: number, field: 'input' | 'expectedOutput', value: string): void {
    this.customTestcases.update(tests =>
      tests.map(t => (t.id === id ? { ...t, [field]: value } : t))
    );
  }

  isTestcasePassed(item: RunResultItem): boolean {
    return (
      item.result?.status === RunStatusEnum.OK &&
      item.result?.stdout?.trim() === item.testcase.expectedOutput.trim()
    );
  }

  getRunStatusLabel(status: RunStatusEnum): string {
    switch (status) {
      case RunStatusEnum.OK: return 'OK';
      case RunStatusEnum.TLE: return 'Time Limit Exceeded';
      case RunStatusEnum.MLE: return 'Memory Limit Exceeded';
      case RunStatusEnum.RE: return 'Runtime Error';
      case RunStatusEnum.CE: return 'Compilation Error';
      default: return 'Unknown';
    }
  }

  openCommandPalette(): void {
    this.commandQuery.set('');
    this.showCommandPalette.set(true);
  }

  closeCommandPalette(): void {
    this.showCommandPalette.set(false);
  }

  runCommand(commandId: string): void {
    switch (commandId) {
      case 'submit':
        this.onSubmit();
        break;
      case 'save-draft':
        this.saveDraft();
        break;
      case 'run':
        this.runCode();
        break;
      case 'tab-statement':
        this.activeTabIndex.set(0);
        break;
      case 'tab-examples':
        this.activeTabIndex.set(1);
        break;
      case 'tab-hints':
        this.activeTabIndex.set(2);
        break;
      case 'toggle-left':
        this.toggleLeftPanel();
        break;
      case 'toggle-right':
        this.toggleRightPanel();
        break;
      case 'split-50-50':
        this.setSplitMode('50-50');
        break;
      default:
        break;
    }
    this.closeCommandPalette();
  }

  onPaletteEnter(): void {
    const first = this.filteredCommands()[0];
    if (first) {
      this.runCommand(first.id);
    }
  }

  setSplitMode(mode: WorkspaceSplitMode): void {
    this.splitMode.set(mode);
    this.workspaceService.setSplitMode(mode);
  }

  toggleLeftPanel(): void {
    this.showLeftPanel.update(v => !v);
  }

  toggleRightPanel(): void {
    this.showRightPanel.update(v => !v);
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
            if (submission.status === SubmissionStatusEnum.Accepted) {
              this.workspaceService.markSolved(problem.id);
            }
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

  onGlobalKeydown(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    const withCommand = event.metaKey || event.ctrlKey;

    if (withCommand && key === 'k') {
      event.preventDefault();
      this.openCommandPalette();
      return;
    }

    if (this.showCommandPalette() && key === 'escape') {
      event.preventDefault();
      this.closeCommandPalette();
      return;
    }

    if (withCommand && key === 's') {
      event.preventDefault();
      this.saveDraft();
      return;
    }

    if (withCommand && key === 'enter') {
      event.preventDefault();
      this.onSubmit();
    }
  }
}
