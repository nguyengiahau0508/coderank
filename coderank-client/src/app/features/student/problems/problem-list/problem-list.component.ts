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

// Services & Models
import { ProblemsModel } from '../../../../data';
import { DifficultyEnum } from '../../../../data';
import { TagsModel } from '../../../../data';
import { ProblemsService } from '../services/problems.service';
import { TagsService } from '../services/tags.service';

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

  // State
  readonly problems = signal<ProblemsModel[]>([]);
  readonly loading = signal<boolean>(false);
  readonly totalRecords = signal<number>(0);
  readonly tags = signal<TagsModel[]>([]);
  readonly showAdvancedFilters = signal<boolean>(false);

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

  ngOnInit(): void {
    this.loadTags();
    this.loadProblems();
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
      params.tagIds = this.selectedTags();
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
    this.showAdvancedFilters.update(v => !v);
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
    this.router.navigate([problem.id], { relativeTo: this.route });
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
}
