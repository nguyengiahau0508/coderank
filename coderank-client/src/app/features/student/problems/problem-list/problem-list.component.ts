import { Component, ChangeDetectionStrategy, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { MultiSelect } from 'primeng/multiselect';
import { Slider } from 'primeng/slider';
import { Tag } from 'primeng/tag';
import { Paginator } from 'primeng/paginator';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Toast } from 'primeng/toast';
import { Tooltip } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { Dialog } from 'primeng/dialog';

// Services & Models
import { ProblemsModel } from '../../../../data';
import { DifficultyEnum } from '../../../../data';
import { TagsModel } from '../../../../data';
import { ProblemsService } from '../services/problems.service';
import { TagsService } from '../services/tags.service';
import {
  ProblemListPreset,
  ProblemListQuickStatus,
  ProblemListSort,
  ProblemListViewMode,
  ProblemsWorkspaceService,
} from '../services/problems-workspace.service';

@Component({
  selector: 'app-student-problem-list',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    Button,
    InputText,
    Select,
    MultiSelect,
    Slider,
    Tag,
    Paginator,
    IconField,
    InputIcon,
    Toast,
    Dialog,
  ],
  providers: [MessageService],
  templateUrl: './problem-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentProblemListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly problemsService = inject(ProblemsService);
  private readonly tagsService = inject(TagsService);
  private readonly messageService = inject(MessageService);
  private readonly workspaceService = inject(ProblemsWorkspaceService);

  // State
  readonly problems = signal<ProblemsModel[]>([]);
  readonly loading = signal<boolean>(false);
  readonly recommendationLoading = signal<boolean>(false);
  readonly learningPathLoading = signal<boolean>(false);
  readonly totalRecords = signal<number>(0);
  readonly tags = signal<TagsModel[]>([]);
  readonly recommendedProblems = signal<ProblemsModel[]>([]);
  readonly activeLearningPath = signal<any | null>(null);
  readonly showAdvancedFilters = signal<boolean>(false);
  readonly quickStatus = signal<ProblemListQuickStatus>('all');
  readonly viewMode = signal<ProblemListViewMode>('list');
  readonly sortBy = signal<ProblemListSort>('newest');
  readonly presetName = signal<string>('');
  readonly showControlsDialog = signal<boolean>(false);

  // Filters
  readonly searchTerm = signal<string>('');
  readonly selectedDifficulty = signal<DifficultyEnum | null>(null);
  readonly selectedTags = signal<number[]>([]);
  readonly pointsRange = signal<number[]>([0, 100]);
  readonly page = signal<number>(1);
  readonly limit = signal<number>(20);

  // Options
  readonly difficultyOptions = [
    { label: 'Dễ', value: DifficultyEnum.Easy },
    { label: 'Trung Bình', value: DifficultyEnum.Medium },
    { label: 'Khó', value: DifficultyEnum.Hard },
  ];

  readonly quickStatusOptions: { label: string; value: ProblemListQuickStatus }[] = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Yêu thích', value: 'favorites' },
    { label: 'Đã giải', value: 'solved' },
    { label: 'Chưa giải', value: 'unsolved' },
  ];

  readonly sortOptions: { label: string; value: ProblemListSort }[] = [
    { label: 'Mới nhất', value: 'newest' },
    { label: 'Cũ nhất', value: 'oldest' },
    { label: 'Điểm cao → thấp', value: 'points-desc' },
    { label: 'Điểm thấp → cao', value: 'points-asc' },
    { label: 'Độ khó tăng dần', value: 'difficulty-asc' },
    { label: 'Độ khó giảm dần', value: 'difficulty-desc' },
    { label: 'Tên A → Z', value: 'title-asc' },
    { label: 'Tên Z → A', value: 'title-desc' },
  ];

  // Computed
  readonly hasFilters = computed(() =>
    !!this.searchTerm() ||
    !!this.selectedDifficulty() ||
    this.selectedTags().length > 0 ||
    this.pointsRange()[0] > 0 ||
    this.pointsRange()[1] < 1000
  );

  readonly tagOptions = computed(() =>
    this.tags().map(tag => ({ label: tag.name, value: tag.id }))
  );

  readonly presets = computed(() => this.workspaceService.presets());
  readonly recentItems = computed(() => this.workspaceService.recentProblems().slice(0, 6));
  readonly favoritesCount = computed(() =>
    this.problems().filter(problem => this.workspaceService.isFavorite(problem.id)).length
  );
  readonly favoriteItems = computed(() =>
    this.problems().filter(problem => this.workspaceService.isFavorite(problem.id)).slice(0, 6)
  );
  readonly solvedCount = computed(() =>
    this.problems().filter(problem => this.workspaceService.isSolved(problem.id)).length
  );

  readonly displayProblems = computed(() => {
    const base = [...this.problems()];

    const filteredByQuick = base.filter(problem => {
      const isFavorite = this.workspaceService.isFavorite(problem.id);
      const isSolved = this.workspaceService.isSolved(problem.id);

      if (this.quickStatus() === 'favorites') return isFavorite;
      if (this.quickStatus() === 'solved') return isSolved;
      if (this.quickStatus() === 'unsolved') return !isSolved;
      return true;
    });

    return filteredByQuick.sort((a, b) => this.compareProblem(a, b, this.sortBy()));
  });

  ngOnInit(): void {
    const prefs = this.workspaceService.preferences();
    this.showAdvancedFilters.set(prefs.showAdvancedFilters);
    this.viewMode.set(prefs.viewMode);
    this.sortBy.set(prefs.sort);
    this.loadTags();
    this.loadProblems();
    this.loadRecommendedProblems();
    this.loadActiveLearningPath();
  }

  /**
   * Load available tags
   */
  loadTags(): void {
    this.tagsService.getTags().subscribe({
      next: (response) => {
        if (!response.data) {
          this.messageService.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không thể tải danh sách tags',
          });
          return;
        }
        this.tags.set(response.data);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể tải danh sách tags',
        });
      }
    });
  }

  /**
   * Load problems from API
   */
  loadProblems(): void {
    this.loading.set(true);

    const params: any = {
      page: this.page(),
      limit: this.limit(),
      isPublished: true,
    };

    if (this.searchTerm()) {
      params.search = this.searchTerm();
    }

    if (this.selectedDifficulty()) {
      params.difficulty = this.selectedDifficulty();
    }

    if (this.selectedTags().length > 0) {
      params.tagIds = this.selectedTags().map(String);
    }

    if (this.pointsRange()[0] > 0) {
      params.minPoints = this.pointsRange()[0];
    }
    if (this.pointsRange()[1] < 1000) {
      params.maxPoints = this.pointsRange()[1];
    }

    this.problemsService.getProblems(params).subscribe({
      next: (response) => {
        this.problems.set(response.data || []);
        this.totalRecords.set(response.meta?.totalItems ?? 0);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  loadRecommendedProblems(): void {
    this.recommendationLoading.set(true);
    this.problemsService.getRecommendedProblems(6).subscribe({
      next: (response) => {
        this.recommendedProblems.set(response.data || []);
        this.recommendationLoading.set(false);
      },
      error: () => {
        this.recommendationLoading.set(false);
      },
    });
  }

  loadActiveLearningPath(): void {
    this.learningPathLoading.set(true);
    this.problemsService.getActiveLearningPath().subscribe({
      next: (response) => {
        this.activeLearningPath.set(response.data || null);
        this.learningPathLoading.set(false);
      },
      error: () => {
        this.learningPathLoading.set(false);
      },
    });
  }

  onPageChange(event: any): void {
    this.page.set(event.page + 1);
    this.limit.set(event.rows);
    this.loadProblems();
  }

  onSearch(): void {
    this.page.set(1);
    this.loadProblems();
  }

  onDifficultyChange(): void {
    this.page.set(1);
    this.loadProblems();
  }

  onTagsChange(): void {
    this.page.set(1);
    this.loadProblems();
  }

  onPointsChange(): void {
    this.page.set(1);
    this.loadProblems();
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters.update(v => {
      const next = !v;
      this.workspaceService.setShowAdvancedFilters(next);
      return next;
    });
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedDifficulty.set(null);
    this.selectedTags.set([]);
    this.pointsRange.set([0, 1000]);
    this.page.set(1);
    this.loadProblems();
  }

  viewProblem(problem: ProblemsModel): void {
    this.workspaceService.addRecent(problem.id, problem.title);
    this.router.navigate([problem.id], { relativeTo: this.route });
  }

  setQuickStatus(status: ProblemListQuickStatus): void {
    this.quickStatus.set(status);
  }

  setSort(sort: ProblemListSort): void {
    this.sortBy.set(sort);
    this.workspaceService.setSort(sort);
  }

  setViewMode(mode: ProblemListViewMode): void {
    this.viewMode.set(mode);
    this.workspaceService.setViewMode(mode);
  }

  toggleFavorite(problemId: number, event: Event): void {
    event.stopPropagation();
    this.workspaceService.toggleFavorite(problemId);
  }

  isFavorite(problemId: number): boolean {
    return this.workspaceService.isFavorite(problemId);
  }

  saveCurrentPreset(): void {
    const name = this.presetName().trim();
    if (!name) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Thiếu tên preset',
        detail: 'Vui lòng nhập tên bộ lọc trước khi lưu.',
      });
      return;
    }

    this.workspaceService.savePreset({
      name,
      searchTerm: this.searchTerm(),
      difficulty: this.selectedDifficulty(),
      tags: this.selectedTags(),
      pointsRange: [this.pointsRange()[0], this.pointsRange()[1]],
      quickStatus: this.quickStatus(),
      sort: this.sortBy(),
    });
    this.presetName.set('');
    this.messageService.add({
      severity: 'success',
      summary: 'Đã lưu preset',
      detail: `Bộ lọc "${name}" đã được lưu.`,
    });
  }

  applyPreset(preset: ProblemListPreset): void {
    this.searchTerm.set(preset.searchTerm);
    this.selectedDifficulty.set(preset.difficulty);
    this.selectedTags.set([...preset.tags]);
    this.pointsRange.set([preset.pointsRange[0], preset.pointsRange[1]]);
    this.quickStatus.set(preset.quickStatus);
    this.sortBy.set(preset.sort);
    this.workspaceService.setSort(preset.sort);
    this.page.set(1);
    this.loadProblems();
  }

  removePreset(id: string): void {
    this.workspaceService.removePreset(id);
  }

  openRecent(problemId: number): void {
    this.router.navigate([problemId], { relativeTo: this.route });
  }

  openRecommended(problemId: number): void {
    this.router.navigate([problemId], { relativeTo: this.route });
  }

  openControlsDialog(): void {
    this.showControlsDialog.set(true);
  }

  closeControlsDialog(): void {
    this.showControlsDialog.set(false);
  }

  getDifficultySeverity(difficulty: DifficultyEnum): 'success' | 'warn' | 'danger' {
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

  getDifficultyLabel(difficulty: DifficultyEnum): string {
    const labels: Record<DifficultyEnum, string> = {
      [DifficultyEnum.Easy]: 'Dễ',
      [DifficultyEnum.Medium]: 'Trung Bình',
      [DifficultyEnum.Hard]: 'Khó',
    };
    return labels[difficulty];
  }

  private compareProblem(a: ProblemsModel, b: ProblemsModel, sort: ProblemListSort): number {
    switch (sort) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'points-desc':
        return (b.points || 0) - (a.points || 0);
      case 'points-asc':
        return (a.points || 0) - (b.points || 0);
      case 'difficulty-asc':
        return this.getDifficultyRank(a.difficulty) - this.getDifficultyRank(b.difficulty);
      case 'difficulty-desc':
        return this.getDifficultyRank(b.difficulty) - this.getDifficultyRank(a.difficulty);
      case 'title-asc':
        return a.title.localeCompare(b.title);
      case 'title-desc':
        return b.title.localeCompare(a.title);
      default:
        return 0;
    }
  }

  private getDifficultyRank(difficulty: DifficultyEnum): number {
    if (difficulty === DifficultyEnum.Easy) return 1;
    if (difficulty === DifficultyEnum.Medium) return 2;
    return 3;
  }
}
