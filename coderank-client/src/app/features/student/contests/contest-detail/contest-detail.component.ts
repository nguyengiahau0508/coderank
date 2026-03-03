import { Component, ChangeDetectionStrategy, OnInit, signal, inject, computed } from '@angular/core';
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

// Services & Models
import { StudentContestsService } from '../services/contests.service';
import {
  ContestsModel,
  ContestProblemsModel,
  ContestParticipantsModel,
  ContestSubmissionsModel,
} from '../../../../data/models/contests.model';
import { ContestStatusEnum, DifficultyEnum, ProgrammingLanguageEnum, SubmissionStatusEnum } from '../../../../data/enums/enums';

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
  ],
  providers: [MessageService],
  templateUrl: './contest-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentContestDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly contestsService = inject(StudentContestsService);
  private readonly messageService = inject(MessageService);

  // State
  readonly contest = signal<ContestsModel | null>(null);
  readonly problems = signal<ContestProblemsModel[]>([]);
  readonly leaderboard = signal<ContestParticipantsModel[]>([]);
  readonly mySubmissions = signal<ContestSubmissionsModel[]>([]);
  readonly loading = signal(true);
  readonly isJoined = signal(false);
  readonly joining = signal(false);
  readonly leaving = signal(false);

  // UI State
  readonly activeTab = signal<'info' | 'problems' | 'leaderboard' | 'submissions'>('info');
  readonly selectedProblem = signal<ContestProblemsModel | null>(null);
  readonly showJoinDialog = signal(false);
  readonly joinPassword = signal('');

  // Code editor state
  readonly currentCode = signal('');
  readonly currentLanguage = signal<ProgrammingLanguageEnum>(ProgrammingLanguageEnum.Python);
  readonly isSubmitting = signal(false);

  readonly tabs = [
    { key: 'info' as const, label: 'Thông tin', icon: 'pi-info-circle' },
    { key: 'problems' as const, label: 'Bài tập', icon: 'pi-code' },
    { key: 'leaderboard' as const, label: 'Bảng xếp hạng', icon: 'pi-chart-bar' },
    { key: 'submissions' as const, label: 'Bài nộp của tôi', icon: 'pi-inbox' },
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

  readonly canLeave = computed(() => {
    const c = this.contest();
    if (!c || !this.isJoined()) return false;
    return c.status === ContestStatusEnum.Draft || c.status === ContestStatusEnum.Upcoming;
  });

  ngOnInit(): void {
    const contestId = this.route.snapshot.paramMap.get('id');
    if (contestId) {
      this.loadContest(contestId);
      this.loadProblems(contestId);
      this.loadLeaderboard(contestId);
    }
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
        // Auto-join: attempt to register automatically
        this.autoJoin(contestId);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải cuộc thi' });
        this.loading.set(false);
      },
    });
  }

  private autoJoin(contestId: string): void {
    const c = this.contest();
    if (!c || c.status === 'ended' || c.status === 'draft') {
      // Contest not joinable, just check existing participation
      this.checkParticipation(contestId);
      return;
    }

    if (!c.isPublic && c.password) {
      // Private contest with password: show dialog, don't auto-join
      this.checkParticipation(contestId);
      return;
    }

    // Auto-join for public contests
    this.joining.set(true);
    this.contestsService.joinContest(contestId).subscribe({
      next: () => {
        this.isJoined.set(true);
        this.joining.set(false);
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã tự động đăng ký tham gia cuộc thi!' });
        this.loadLeaderboard(contestId);
        this.loadMySubmissions(contestId);
      },
      error: (err) => {
        this.joining.set(false);
        if (err?.error?.message === 'Already joined this contest' || err?.status === 400) {
          // Already joined - that's fine
          this.isJoined.set(true);
          this.loadMySubmissions(contestId);
        } else {
          this.checkParticipation(contestId);
        }
      },
    });
  }

  private checkParticipation(contestId: string): void {
    this.contestsService.getParticipants(contestId).subscribe({
      next: (res) => {
        // This is a simple check - in a real app you'd check against current user ID
        // For now, we'll try to load submissions as a proxy
        this.loadMySubmissions(contestId);
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
        // If we got submissions, user is joined
        this.isJoined.set(true);
      },
      error: () => {
        // If 403/401 or error, likely not joined
        this.isJoined.set(false);
      },
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
    this.selectedProblem.set(problem);
    this.currentCode.set('');
    this.activeTab.set('problems');
  }

  backToProblems(): void {
    this.selectedProblem.set(null);
  }

  onCodeChange(code: string): void {
    this.currentCode.set(code);
  }

  onLanguageChange(language: ProgrammingLanguageEnum): void {
    this.currentLanguage.set(language);
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

  /** Check if user has accepted submission for a problem */
  isProblemSolved(problemId: string): boolean {
    return this.mySubmissions().some(s => s.problemId === problemId && s.status === SubmissionStatusEnum.Accepted);
  }

  /** Check if user has any submission (attempted but not solved) */
  isProblemAttempted(problemId: string): boolean {
    return this.mySubmissions().some(s => s.problemId === problemId);
  }
}
