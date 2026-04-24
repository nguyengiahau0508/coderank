import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  OnInit,
  signal,
  inject,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';

// Components
import { CodeEditorComponent } from '../../../../shared/components/code-editor/code-editor.component';
import { MarkdownViewComponent } from '../../../../shared/components/markdown-view/markdown-view.component';

// Services & Models
import { StudentContestsService } from '../services/contests.service';
import {
  ContestsModel,
  ContestProblemsModel,
  ContestParticipantsModel,
  ContestSubmissionsModel,
  ContestLeaderboardSocket,
  ProblemsApi,
  ProblemsModel,
  TestcasesModel,
  RunnerApi,
  RunResult,
  RunStatusEnum,
} from '../../../../data';
import { ContestStatusEnum, DifficultyEnum, ProgrammingLanguageEnum, SubmissionStatusEnum } from '../../../../data';
import { Subscription, firstValueFrom } from 'rxjs';

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
  selector: 'app-student-contest-detail',
  imports: [
    CommonModule,
    FormsModule,
    Button,
    Tag,
    Toast,
    Dialog,
    InputText,
    CodeEditorComponent,
    MarkdownViewComponent,
  ],
  providers: [MessageService],
  templateUrl: './contest-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentContestDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly contestsService = inject(StudentContestsService);
  private readonly problemsApi = inject(ProblemsApi);
  private readonly runnerApi = inject(RunnerApi);
  private readonly messageService = inject(MessageService);
  private readonly contestLeaderboardSocket = inject(ContestLeaderboardSocket);

  private leaderboardSubscription: Subscription | null = null;
  private readonly problemDetailCache = new Map<string, ProblemsModel>();
  private readonly sampleTestcaseCache = new Map<string, TestcasesModel[]>();

  // State
  readonly contest = signal<ContestsModel | null>(null);
  readonly problems = signal<ContestProblemsModel[]>([]);
  readonly leaderboard = signal<ContestParticipantsModel[]>([]);
  readonly mySubmissions = signal<ContestSubmissionsModel[]>([]);
  readonly sampleTestcases = signal<TestcasesModel[]>([]);
  readonly loading = signal(true);
  readonly isJoined = signal(false);
  readonly joining = signal(false);
  readonly leaving = signal(false);

  // UI State
  readonly activeTab = signal<'info' | 'problems' | 'leaderboard' | 'submissions'>('info');
  readonly selectedProblem = signal<ContestProblemsModel | null>(null);
  readonly showJoinDialog = signal(false);
  readonly joinPassword = signal('');
  readonly problemDetailTabIndex = signal<number>(0);

  // Code editor state
  readonly currentCode = signal('');
  readonly currentLanguage = signal<ProgrammingLanguageEnum>(ProgrammingLanguageEnum.Python);
  readonly isSubmitting = signal(false);
  readonly editorTabIndex = signal<number>(0); // 0 = Code Editor, 1 = Chạy thử

  // Run code state
  readonly isRunning = signal<boolean>(false);
  readonly customTestcases = signal<CustomTestcase[]>([]);
  readonly runResults = signal<RunResultItem[]>([]);
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

  readonly tabs = [
    { key: 'info' as const, label: 'Thông tin', icon: 'pi-info-circle' },
    { key: 'problems' as const, label: 'Bài tập', icon: 'pi-code' },
    { key: 'leaderboard' as const, label: 'Bảng xếp hạng', icon: 'pi-chart-bar' },
    { key: 'submissions' as const, label: 'Bài nộp của tôi', icon: 'pi-inbox' },
  ];
  readonly detailTabs: DetailTabItem[] = [
    { label: 'Đề bài', icon: 'pi-file', index: 0 },
    { label: 'Ví dụ', icon: 'pi-list', index: 1 },
    { label: 'Lịch sử', icon: 'pi-history', index: 2 },
  ];

  readonly languageOptions = [
    { label: 'Python', value: ProgrammingLanguageEnum.Python },
    { label: 'JavaScript', value: ProgrammingLanguageEnum.JavaScript },
    { label: 'TypeScript', value: ProgrammingLanguageEnum.TypeScript },
    { label: 'Java', value: ProgrammingLanguageEnum.Java },
    { label: 'C++', value: ProgrammingLanguageEnum.CPlusPlus },
    { label: 'C', value: ProgrammingLanguageEnum.C },
    { label: 'Go', value: ProgrammingLanguageEnum.Go },
    { label: 'Rust', value: ProgrammingLanguageEnum.Rust },
  ];

  readonly canSubmit = computed(() => {
    const c = this.contest();
    return c?.status === ContestStatusEnum.Running && this.isJoined();
  });

  readonly canJoin = computed(() => {
    const c = this.contest();
    if (!c || this.isJoined()) {
      return false;
    }

    return (
      c.status === ContestStatusEnum.Upcoming ||
      c.status === ContestStatusEnum.Running
    );
  });

  readonly canLeave = computed(() => {
    const c = this.contest();
    if (!c || !this.isJoined()) return false;
    return c.status === ContestStatusEnum.Draft || c.status === ContestStatusEnum.Upcoming;
  });

  readonly selectedProblemSubmissions = computed(() => {
    const selected = this.selectedProblem();
    if (!selected) {
      return [];
    }

    return this.mySubmissions()
      .filter((submission) => submission.problemId === selected.problemId)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  });

  ngOnInit(): void {
    const contestId = this.route.snapshot.paramMap.get('id');
    if (contestId) {
      this.loadContest(contestId);
      this.loadProblems(contestId);
      this.loadLeaderboard(contestId);
      this.loadParticipationStatus(contestId);
      this.setupLeaderboardRealtime(contestId);
    }
  }

  ngOnDestroy(): void {
    this.leaderboardSubscription?.unsubscribe();
    this.contestLeaderboardSocket.disconnect();
  }

  private get contestId(): string {
    return this.route.snapshot.paramMap.get('id') || '';
  }

  private loadContest(contestId: string): void {
    this.loading.set(true);
    this.contestsService.getContest(contestId).subscribe({
      next: (res) => {
        this.contest.set(res.data || null);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải cuộc thi' });
        this.loading.set(false);
      },
    });
  }

  private loadParticipationStatus(contestId: string): void {
    this.contestsService.getMyParticipation(contestId).subscribe({
      next: (res) => {
        this.isJoined.set(!!res.data);
        if (res.data) {
          this.loadMySubmissions(contestId);
        }
      },
      error: () => {
        this.isJoined.set(false);
      },
    });
  }

  private setupLeaderboardRealtime(contestId: string): void {
    this.contestLeaderboardSocket.connect(contestId);
    this.leaderboardSubscription = this.contestLeaderboardSocket
      .onLeaderboardUpdated()
      .subscribe({
        next: (payload) => {
          if (payload.contestId !== contestId) {
            return;
          }
          this.leaderboard.set(payload.leaderboard || []);
        },
      });
  }

  private loadProblems(contestId: string): void {
    this.contestsService.getContestProblems(contestId).subscribe({
      next: (res) => this.problems.set(res.data || []),
      error: () => {},
    });
  }

  private loadLeaderboard(contestId: string): void {
    this.contestsService.getLeaderboard(contestId).subscribe({
      next: (res) => this.leaderboard.set(res.data || []),
      error: () => {},
    });
  }

  private loadMySubmissions(contestId: string): void {
    this.contestsService.getMySubmissions(contestId).subscribe({
      next: (res) => {
        this.mySubmissions.set(res.data || []);
      },
      error: () => {},
    });
  }

  goBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  setActiveTab(tab: 'info' | 'problems' | 'leaderboard' | 'submissions'): void {
    this.activeTab.set(tab);
    if (tab === 'submissions') {
      this.selectedProblem.set(null);
    }
  }

  // ==================== Join Contest ====================

  onJoinClick(): void {
    const c = this.contest();
    if (!c) return;

    if (!c.isPublic) {
      this.showJoinDialog.set(true);
    } else {
      this.joinContest();
    }
  }

  joinContest(): void {
    this.joining.set(true);
    const dto = this.joinPassword() ? { password: this.joinPassword() } : undefined;

    this.contestsService.joinContest(this.contestId, dto).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã tham gia cuộc thi!' });
        this.isJoined.set(true);
        this.showJoinDialog.set(false);
        this.joining.set(false);
        this.joinPassword.set('');
        this.loadMySubmissions(this.contestId);
        this.loadLeaderboard(this.contestId);
      },
      error: (err) => {
        const msg = err?.error?.message || 'Không thể tham gia cuộc thi';
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: msg });
        this.joining.set(false);
      },
    });
  }

  // ==================== Problem Solving ====================

  leaveContest(): void {
    this.leaving.set(true);
    this.contestsService.leaveContest(this.contestId).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã hủy đăng ký cuộc thi' });
        this.isJoined.set(false);
        this.mySubmissions.set([]);
        this.leaving.set(false);
        this.loadLeaderboard(this.contestId);
      },
      error: (err) => {
        const msg = err?.error?.message || 'Không thể hủy đăng ký';
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: msg });
        this.leaving.set(false);
      },
    });
  }

  selectProblem(problem: ContestProblemsModel): void {
    this.selectedProblem.set({ ...problem });
    this.currentCode.set('');
    this.problemDetailTabIndex.set(0);
    this.editorTabIndex.set(0);
    this.runResults.set([]);
    this.customTestcases.set([]);
    this.activeTab.set('problems');
    this.loadProblemDetail(problem.problemId);
    this.loadSampleTestcases(problem.problemId);
  }

  backToProblems(): void {
    this.selectedProblem.set(null);
    this.sampleTestcases.set([]);
    this.runResults.set([]);
    this.customTestcases.set([]);
  }

  private loadProblemDetail(problemId: string): void {
    const cachedProblem = this.problemDetailCache.get(problemId);
    if (cachedProblem) {
      this.selectedProblem.update((current) => {
        if (!current || current.problemId !== problemId) {
          return current;
        }

        return {
          ...current,
          problem: cachedProblem,
        };
      });
      return;
    }

    this.problemsApi.getProblem(problemId).subscribe({
      next: (res) => {
        const problem = res.data;
        if (!problem) {
          return;
        }

        this.problemDetailCache.set(problemId, problem);
        this.selectedProblem.update((current) => {
          if (!current || current.problemId !== problemId) {
            return current;
          }

          return {
            ...current,
            problem,
          };
        });
      },
      error: () => {
        // Keep fallback data from contest problem relation when detail call fails.
      },
    });
  }

  private loadSampleTestcases(problemId: string): void {
    const cachedTestcases = this.sampleTestcaseCache.get(problemId);
    if (cachedTestcases) {
      this.sampleTestcases.set(cachedTestcases);
      return;
    }

    this.problemsApi.getSampleTestcases(problemId).subscribe({
      next: (res) => {
        const testcases = (res.data || []).filter((tc) => tc.isSample !== false);
        this.sampleTestcaseCache.set(problemId, testcases);
        if (this.selectedProblem()?.problemId === problemId) {
          this.sampleTestcases.set(testcases);
        }
      },
      error: () => {
        if (this.selectedProblem()?.problemId === problemId) {
          this.sampleTestcases.set([]);
        }
      },
    });
  }

  onCodeChange(code: string): void {
    this.currentCode.set(code);
  }

  onLanguageChange(language: ProgrammingLanguageEnum): void {
    this.currentLanguage.set(language);
  }

  async runCode(): Promise<void> {
    const code = this.currentCode();
    const problem = this.selectedProblem();
    if (!problem) {
      return;
    }

    if (!code.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Không có code',
        detail: 'Vui lòng nhập code trước khi chạy thử.',
        life: 2000,
      });
      return;
    }

    const sampleTests: CustomTestcase[] = this.sampleTestcases().map((tc, idx) => ({
      id: -(idx + 1),
      input: tc.input,
      expectedOutput: tc.expectedOutput,
    }));
    const allTestcases = [...sampleTests, ...this.customTestcases()];

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
    this.editorTabIndex.set(1);
    this.runResults.set(
      allTestcases.map((tc) => ({ testcase: tc, result: null, running: true })),
    );

    const timeLimit = problem.problem?.timeLimitMs ?? 1000;
    const memoryLimit = (problem.problem?.memoryLimitMb ?? 256) * 1024;

    for (let i = 0; i < allTestcases.length; i++) {
      const tc = allTestcases[i];
      try {
        const response = await firstValueFrom(
          this.runnerApi.runCode({
            code,
            language: this.currentLanguage(),
            input: tc.input,
            timeLimit,
            memoryLimit,
          }),
        );

        this.runResults.update((results) => {
          const updated = [...results];
          updated[i] = {
            ...updated[i],
            result: response.data ?? null,
            running: false,
          };
          return updated;
        });
      } catch {
        this.runResults.update((results) => {
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

    const passed = this.runPassedCount();
    const total = allTestcases.length;
    this.messageService.add({
      severity: passed === total ? 'success' : 'warn',
      summary: passed === total ? 'Tất cả test case đều pass!' : 'Một số test case không pass',
      detail: `${passed}/${total} test case pass`,
      life: 3000,
    });
  }

  addCustomTestcase(): void {
    this.customTestcases.update((tests) => [
      ...tests,
      { id: this.nextCustomId++, input: '', expectedOutput: '' },
    ]);
  }

  removeCustomTestcase(id: number): void {
    this.customTestcases.update((tests) => tests.filter((testcase) => testcase.id !== id));
  }

  updateCustomTestcase(id: number, field: 'input' | 'expectedOutput', value: string): void {
    this.customTestcases.update((tests) =>
      tests.map((testcase) =>
        testcase.id === id ? { ...testcase, [field]: value } : testcase,
      ),
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
      case RunStatusEnum.OK:
        return 'OK';
      case RunStatusEnum.TLE:
        return 'Time Limit Exceeded';
      case RunStatusEnum.MLE:
        return 'Memory Limit Exceeded';
      case RunStatusEnum.RE:
        return 'Runtime Error';
      case RunStatusEnum.CE:
        return 'Compilation Error';
      default:
        return 'Unknown';
    }
  }

  submitSolution(): void {
    const problem = this.selectedProblem();
    if (!problem || !this.currentCode().trim()) return;

    this.isSubmitting.set(true);

    this.contestsService.submitSolution(this.contestId, problem.problemId, {
      code: this.currentCode(),
      language: this.currentLanguage(),
    }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã nộp bài!' });
        this.isSubmitting.set(false);
        this.loadMySubmissions(this.contestId);
        this.loadLeaderboard(this.contestId);
      },
      error: (err) => {
        const msg = err?.error?.message || 'Không thể nộp bài';
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: msg });
        this.isSubmitting.set(false);
      },
    });
  }

  // ==================== Helpers ====================

  getStatusSeverity(status: ContestStatusEnum): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    return this.contestsService.getStatusSeverity(status);
  }

  getStatusLabel(status: ContestStatusEnum): string {
    return this.contestsService.getStatusLabel(status);
  }

  getSubmissionStatusLabel(status: SubmissionStatusEnum): string {
    return this.contestsService.getSubmissionStatusLabel(status);
  }

  getSubmissionStatusSeverity(status: SubmissionStatusEnum): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    return this.contestsService.getSubmissionStatusSeverity(status);
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  getDuration(): string {
    const c = this.contest();
    if (!c) return '—';
    if (c.durationMinutes) return `${c.durationMinutes} phút`;
    if (c.startTime && c.endTime) {
      const diffMs = new Date(c.endTime).getTime() - new Date(c.startTime).getTime();
      const diffMins = Math.round(diffMs / 60000);
      if (diffMins < 60) return `${diffMins} phút`;
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours} giờ`;
    }
    return '—';
  }

  getLanguageLabel(lang: string): string {
    const labels: Record<string, string> = {
      python: 'Python', javascript: 'JavaScript', typescript: 'TypeScript',
      java: 'Java', cpp: 'C++', c: 'C', go: 'Go', rust: 'Rust',
    };
    return labels[lang] || lang;
  }

  getDifficultyLabel(difficulty: DifficultyEnum | string | undefined): string {
    if (!difficulty) return '—';
    const labels: Record<string, string> = {
      [DifficultyEnum.Easy]: 'Dễ',
      [DifficultyEnum.Medium]: 'Trung bình',
      [DifficultyEnum.Hard]: 'Khó',
    };
    return labels[difficulty] || difficulty;
  }

  getDifficultySeverity(difficulty: DifficultyEnum | string | undefined): 'success' | 'warn' | 'danger' | 'secondary' {
    switch (difficulty) {
      case DifficultyEnum.Easy: return 'success';
      case DifficultyEnum.Medium: return 'warn';
      case DifficultyEnum.Hard: return 'danger';
      default: return 'secondary';
    }
  }

  getDifficultyColor(difficulty: DifficultyEnum | string | undefined): string {
    switch (difficulty) {
      case DifficultyEnum.Easy: return 'text-green-500';
      case DifficultyEnum.Medium: return 'text-yellow-500';
      case DifficultyEnum.Hard: return 'text-red-500';
      default: return 'text-surface-400';
    }
  }

  getProblemSubmissionCount(problemId: string): number {
    return this.mySubmissions().filter((submission) => submission.problemId === problemId).length;
  }

  getProblemAcceptedCount(problemId: string): number {
    return this.mySubmissions().filter(
      (submission) =>
        submission.problemId === problemId &&
        submission.status === SubmissionStatusEnum.Accepted,
    ).length;
  }

  getProblemBestScore(problemId: string): number {
    return this.mySubmissions()
      .filter((submission) => submission.problemId === problemId)
      .reduce((bestScore, submission) => Math.max(bestScore, submission.score ?? 0), 0);
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Đã sao chép',
        life: 1500,
      });
    });
  }

  /** Check if user has accepted submission for a problem */
  isProblemSolved(problemId: string): boolean {
    return this.mySubmissions().some(s => s.problemId === problemId && s.status === SubmissionStatusEnum.Accepted);
  }

  /** Check if user has any submission (attempted but not solved) */
  isProblemAttempted(problemId: string): boolean {
    return this.mySubmissions().some(s => s.problemId === problemId);
  }
}
