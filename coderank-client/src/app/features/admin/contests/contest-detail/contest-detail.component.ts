import { Component, ChangeDetectionStrategy, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

// PrimeNG
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Tooltip } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';

// Services & Models
import { ContestsService } from '../services/contests.service';
import { ProblemsApi } from '../../../../data';
import { ProblemsModel } from '../../../../data';
import { ContestsModel, ContestProblemsModel, ContestParticipantsModel, ContestSubmissionsModel } from '../../../../data';
import { ContestStatusEnum, DifficultyEnum, SubmissionStatusEnum } from '../../../../data';

@Component({
  selector: 'app-admin-contest-detail',
  imports: [
    CommonModule,
    FormsModule,
    Button,
    Tag,
    Toast,
    ConfirmDialog,
    Dialog,
    InputText,
    InputNumber,
    Tooltip,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './contest-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminContestDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly contestsService = inject(ContestsService);
  private readonly problemsApi = inject(ProblemsApi);
  private readonly messageService = inject(MessageService);
  private readonly confirmService = inject(ConfirmationService);

  // State
  readonly contest = signal<ContestsModel | null>(null);
  readonly problems = signal<ContestProblemsModel[]>([]);
  readonly participants = signal<ContestParticipantsModel[]>([]);
  readonly leaderboard = signal<ContestParticipantsModel[]>([]);
  readonly submissions = signal<ContestSubmissionsModel[]>([]);
  readonly loading = signal(true);

  // UI State
  readonly activeTab = signal<'overview' | 'problems' | 'participants' | 'leaderboard' | 'submissions'>('overview');

  // Add Problem dialog
  readonly showAddProblemDialog = signal(false);
  readonly newProblemLabel = signal('');
  readonly newProblemPoints = signal<number>(100);
  readonly addingProblem = signal(false);

  // Problem search
  readonly problemSearchQuery = signal('');
  readonly availableProblems = signal<ProblemsModel[]>([]);
  readonly searchingProblems = signal(false);
  readonly selectedProblem = signal<ProblemsModel | null>(null);
  private readonly searchSubject = new Subject<string>();

  // Computed: problems already added (to filter them out)
  readonly addedProblemIds = computed(() => new Set(this.problems().map(p => p.problemId)));

  // Computed: filtered available problems (exclude already added)
  readonly filteredProblems = computed(() => {
    const added = this.addedProblemIds();
    return this.availableProblems().filter(p => !added.has(String(p.id)));
  });

  readonly tabs = [
    { key: 'overview' as const, label: 'Tổng quan', icon: 'pi-info-circle' },
    { key: 'problems' as const, label: 'Bài tập', icon: 'pi-code' },
    { key: 'participants' as const, label: 'Thí sinh', icon: 'pi-users' },
    { key: 'leaderboard' as const, label: 'Bảng xếp hạng', icon: 'pi-chart-bar' },
    { key: 'submissions' as const, label: 'Bài nộp', icon: 'pi-inbox' },
  ];

  ngOnInit(): void {
    const contestId = this.route.snapshot.paramMap.get('id');
    if (contestId) {
      this.loadContest(contestId);
      this.loadProblems(contestId);
      this.loadParticipants(contestId);
      this.loadLeaderboard(contestId);
      this.loadSubmissions(contestId);
    }

    // Setup debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        this.searchingProblems.set(true);
        return this.problemsApi.getProblems({
          search: query || undefined,
          limit: 20,
          isPublished: true,
        });
      }),
    ).subscribe({
      next: (res) => {
        this.availableProblems.set(res.data || []);
        this.searchingProblems.set(false);
      },
      error: () => {
        this.searchingProblems.set(false);
      },
    });
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

  private loadProblems(contestId: string): void {
    this.contestsService.getContestProblems(contestId).subscribe({
      next: (res) => this.problems.set(res.data || []),
      error: () => {},
    });
  }

  private loadParticipants(contestId: string): void {
    this.contestsService.getContestParticipants(contestId).subscribe({
      next: (res) => this.participants.set(res.data || []),
      error: () => {},
    });
  }

  private loadLeaderboard(contestId: string): void {
    this.contestsService.getContestLeaderboard(contestId).subscribe({
      next: (res) => this.leaderboard.set(res.data || []),
      error: () => {},
    });
  }

  private loadSubmissions(contestId: string): void {
    this.contestsService.getAllContestSubmissions(this.getContestId()).subscribe({
      next: (res) => this.submissions.set(res.data || []),
      error: () => {},
    });
  }

  private getContestId(): string {
    return this.route.snapshot.paramMap.get('id') || '';
  }

  goBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  setActiveTab(tab: 'overview' | 'problems' | 'participants' | 'leaderboard' | 'submissions'): void {
    this.activeTab.set(tab);
  }

  // ==================== Problem Management ====================

  openAddProblemDialog(): void {
    this.newProblemLabel.set('');
    this.newProblemPoints.set(100);
    this.selectedProblem.set(null);
    this.problemSearchQuery.set('');
    this.showAddProblemDialog.set(true);
    // Load initial problems
    this.searchSubject.next('');
  }

  onProblemSearch(query: string): void {
    this.problemSearchQuery.set(query);
    this.searchSubject.next(query);
  }

  selectProblemToAdd(problem: ProblemsModel): void {
    this.selectedProblem.set(problem);
    // Auto-set points from problem default
    if (problem.points) {
      this.newProblemPoints.set(problem.points);
    }
  }

  deselectProblem(): void {
    this.selectedProblem.set(null);
  }

  addProblem(): void {
    const selected = this.selectedProblem();
    if (!selected) return;
    this.addingProblem.set(true);

    this.contestsService.addProblemToContest(this.getContestId(), {
      problemId: String(selected.id),
      label: this.newProblemLabel() || undefined,
      points: this.newProblemPoints(),
      problemOrder: this.problems().length,
    }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã thêm bài tập' });
        this.showAddProblemDialog.set(false);
        this.addingProblem.set(false);
        this.loadProblems(this.getContestId());
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể thêm bài tập' });
        this.addingProblem.set(false);
      },
    });
  }

  removeProblem(problem: ContestProblemsModel): void {
    this.confirmService.confirm({
      message: `Xóa bài "${problem.label || problem.problemId}" khỏi cuộc thi?`,
      header: 'Xác nhận',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.contestsService.removeProblemFromContest(this.getContestId(), problem.problemId).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa bài tập' });
            this.loadProblems(this.getContestId());
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể xóa bài tập' });
          },
        });
      },
    });
  }

  // ==================== Participant Management ====================

  removeParticipant(participant: ContestParticipantsModel): void {
    this.confirmService.confirm({
      message: `Xóa thí sinh "${participant.user?.username || participant.userId}" khỏi cuộc thi?`,
      header: 'Xác nhận',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.contestsService.removeParticipant(this.getContestId(), participant.userId).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa thí sinh' });
            this.loadParticipants(this.getContestId());
            this.loadLeaderboard(this.getContestId());
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể xóa thí sinh' });
          },
        });
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
}
