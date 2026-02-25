import { Component, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubmissionsModel } from '../../../../../data/models/submissions.model';
import { SubmissionsService } from '../../services/submissions.service';

@Component({
  selector: 'app-admin-submission-result',
  imports: [CommonModule],
  templateUrl: './submission-result.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSubmissionResultComponent {
  private readonly submissionsService = inject(SubmissionsService);

  readonly submission = input.required<SubmissionsModel>();

  /**
   * Get status label
   */
  getStatusLabel(): string {
    return this.submissionsService.getStatusLabel(this.submission().status);
  }

  /**
   * Get status severity
   */
  getStatusSeverity(): 'success' | 'danger' | 'warn' | 'info' {
    return this.submissionsService.getStatusSeverity(this.submission().status);
  }

  /**
   * Get success rate percentage
   */
  getSuccessRate(): number {
    const sub = this.submission();
    if (sub.totalTestcases === 0) return 0;
    return Math.round((sub.passedTestcases / sub.totalTestcases) * 100);
  }

  /**
   * Check if submission is final
   */
  isFinal(): boolean {
    return this.submissionsService.isSubmissionFinal(this.submission().status);
  }
}
