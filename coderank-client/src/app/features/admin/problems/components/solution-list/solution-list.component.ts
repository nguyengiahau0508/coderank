import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { SolutionsModel } from '../../../../../data/models/solutions.model';

@Component({
  selector: 'app-admin-solution-list',
  imports: [CommonModule, Button, Tooltip],
  templateUrl: './solution-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
})
export class AdminSolutionListComponent {
  readonly solutions = input<SolutionsModel[]>([]);
  readonly mySolutions = input<SolutionsModel[]>([]);
  readonly hasAccepted = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly mySolutionsLoading = input<boolean>(false);

  readonly shareSolution = output<void>();
  readonly editSolution = output<SolutionsModel>();
  readonly deleteSolution = output<SolutionsModel>();

  // Sub-tab: 0 = All Solutions, 1 = My Solutions
  readonly activeSubTab = signal<number>(0);

  // Currently selected solution for detail view (replaces entire tab content)
  readonly selectedSolution = signal<SolutionsModel | null>(null);

  viewDetail(solution: SolutionsModel): void {
    this.selectedSolution.set(solution);
  }

  backToList(): void {
    this.selectedSolution.set(null);
  }

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

  getLanguageColor(lang: string): string {
    const colors: Record<string, string> = {
      python: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      javascript: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      typescript: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      java: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      cpp: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      c: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
      go: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      rust: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[lang] || 'bg-surface-100 text-surface-600';
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }
}
