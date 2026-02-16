import { Component, ChangeDetectionStrategy, OnInit, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { MultiSelect } from 'primeng/multiselect';
import { Slider } from 'primeng/slider';
import { Badge } from 'primeng/badge';
import { Skeleton } from 'primeng/skeleton';
import { Paginator } from 'primeng/paginator';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';

// Services & Models
import { ProblemsService } from '../services/problems.service';
import { ProblemsModel } from '../../../data/models/problems.model';
import { DifficultyEnum } from '../../../data/enums/enums';
import { TagsModel } from '../../../data/models/tags.model';

@Component({
  selector: 'app-problems-list',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    Button,
    InputText,
    Select,
    MultiSelect,
    Slider,
    Paginator,
    IconField,
    InputIcon,
  ],
  templateUrl: './problems-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProblemsListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly problemsService = inject(ProblemsService);

  // State
  readonly problems = signal<ProblemsModel[]>([]);
  readonly loading = signal<boolean>(false);
  readonly totalRecords = signal<number>(0);
  readonly allTags = signal<TagsModel[]>([]);
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
    this.allTags().map(tag => ({ label: tag.name, value: tag.id }))
  );

  ngOnInit(): void {
    this.loadTags();
    this.loadProblems();
  }

  /**
   * Load available tags
   */
  loadTags(): void {
    // Extract unique tags from all problems
    // In real scenario, you should have a separate tags API endpoint
    this.problemsService.getProblems({ limit: 1000 }).subscribe({
      next: (response) => {
        const tagsMap = new Map<number, TagsModel>();
        response.data.forEach(problem => {
          problem.tags?.forEach(tag => {
            if (!tagsMap.has(tag.id)) {
              tagsMap.set(tag.id, tag);
            }
          });
        });
        this.allTags.set(Array.from(tagsMap.values()));
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

    // Only add points filter if not default range
    if (this.pointsRange()[0] > 0) {
      params.minPoints = this.pointsRange()[0];
    }
    if (this.pointsRange()[1] < 1000) {
      params.maxPoints = this.pointsRange()[1];
    }
    console.log('Loading problems with params:', params);
    this.problemsService.getProblems(params).subscribe({
      next: (response) => {
        console.log('Loaded problems:', response);
        this.problems.set(response.data);
        this.totalRecords.set(response.meta.totalItems);
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
    this.router.navigate(['/problems', problem.id]);
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
