import { Component, ChangeDetectionStrategy, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
import { Dialog } from 'primeng/dialog';
import { Toast } from 'primeng/toast';
import { Tooltip } from 'primeng/tooltip';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

// Services & Models
import { ProblemsModel } from '../../../../data/models/problems.model';
import { DifficultyEnum } from '../../../../data/enums/enums';
import { TagsModel } from '../../../../data/models/tags.model';
import { AdminProblemFormDialogComponent } from '../components/problem-form-dialog/problem-form-dialog.component';
import { AdminTestcaseManagerComponent } from '../components/testcase-manager/testcase-manager.component';
import { AdminHintManagerComponent } from '../components/hint-manager/hint-manager.component';
import { ProblemsApi } from '../../../../data/api';

@Component({
  selector: 'app-problem-list',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
    Dialog,
    Toast,
    Tooltip,
    ConfirmDialog,
    AdminProblemFormDialogComponent,
    AdminTestcaseManagerComponent,
    AdminHintManagerComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './problem-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProblemListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly problemsApi = inject(ProblemsApi)
  private readonly messageService = inject(MessageService);
  private readonly confirmService = inject(ConfirmationService);

  // State
  readonly problems = signal<ProblemsModel[]>([]);
  readonly loading = signal<boolean>(false);
  readonly totalRecords = signal<number>(0);
  readonly tags = signal<TagsModel[]>([]);
  readonly showAdvancedFilters = signal<boolean>(false);

  // Dialog states
  readonly showProblemDialog = signal<boolean>(false);
  readonly showTestcaseDialog = signal<boolean>(false);
  readonly showHintDialog = signal<boolean>(false);
  readonly selectedProblem = signal<ProblemsModel | null>(null);
  readonly editingProblem = signal<ProblemsModel | null>(null);
  readonly isSubmittingDialog = signal<boolean>(false);

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
    // Extract unique tags from all problems
    // In real scenario, you should have a separate tags API endpoint
    this.problemsApi.getTags().subscribe({
      next: (response) => {
        console.log('Loaded tags:', response);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load tags',
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

    // Only add points filter if not default range
    if (this.pointsRange()[0] > 0) {
      params.minPoints = this.pointsRange()[0];
    }
    if (this.pointsRange()[1] < 1000) {
      params.maxPoints = this.pointsRange()[1];
    }

    this.problemsApi.getProblems(params).subscribe({
      next: (response) => {
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
    this.router.navigate([problem.id], { relativeTo: this.route });
  }

  /**
   * Open dialog to create new problem
   */
  createProblem(): void {
    this.editingProblem.set(null);
    this.showProblemDialog.set(true);
  }

  /**
   * Open dialog to edit problem (fetch full detail first)
   */
  editProblem(event: Event, problem: ProblemsModel): void {
    event.stopPropagation();
    this.loading.set(true);
    this.problemsApi.getProblem(problem.id.toString()).subscribe({
      next: (response) => {
        if (response.data) {
          this.editingProblem.set(response.data);
          this.showProblemDialog.set(true);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load problem details',
          });
        }
        this.showProblemDialog.set(true);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load problem details',
        });
        this.loading.set(false);
      },
    });
  }

  /**
   * Delete problem with confirmation
   */
  deleteProblem(event: Event, problem: ProblemsModel): void {
    event.stopPropagation();
    this.confirmService.confirm({
      message: `Are you sure you want to delete "${problem.title}"?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.problemsApi.deleteProblem(problem.id.toString()).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Problem deleted successfully',
            });
            this.loadProblems();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete problem',
            });
          },
        });
      },
    });
  }

  /**
   * Open hint manager
   */
  manageHints(event: Event, problem: ProblemsModel): void {
    event.stopPropagation();
    this.selectedProblem.set(problem);
    this.showHintDialog.set(true);
  }

  /**
   * Open testcase manager
   */
  manageTestcases(event: Event, problem: ProblemsModel): void {
    event.stopPropagation();
    this.selectedProblem.set(problem);
    this.showTestcaseDialog.set(true);
  }

  /**
   * Handle problem form submission
   */
  onProblemSave(data: any): void {
    this.isSubmittingDialog.set(true);
    if (this.editingProblem()) {
      // Update
      this.problemsApi.updateProblem(this.editingProblem()!.id.toString(), data).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Problem updated successfully',
          });
          this.showProblemDialog.set(false);
          this.isSubmittingDialog.set(false);
          this.loadProblems();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update problem',
          });
          this.isSubmittingDialog.set(false);
        },
      });
    } else {
      // Create
      this.problemsApi.createProblem(data).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Problem created successfully',
          });
          this.showProblemDialog.set(false);
          this.isSubmittingDialog.set(false);
          this.page.set(1);
          this.loadProblems();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create problem',
          });
          this.isSubmittingDialog.set(false);
        },
      });
    }
  }

  /**
   * Close dialogs
   */
  closeProblemDialog(): void {
    this.showProblemDialog.set(false);
  }

  closeTestcaseDialog(): void {
    this.showTestcaseDialog.set(false);
    this.selectedProblem.set(null);
    this.loadProblems();
  }

  closeHintDialog(): void {
    this.showHintDialog.set(false);
    this.selectedProblem.set(null);
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
