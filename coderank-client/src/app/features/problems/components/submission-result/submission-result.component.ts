import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubmissionsModel } from '../../../../data/models/submissions.model';
import { SubmissionsService } from '../../services/submissions.service';

@Component({
  selector: 'app-submission-result',
  imports: [CommonModule],
  templateUrl: './submission-result.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubmissionResultComponent {
  readonly submission = input.required<SubmissionsModel>();

  constructor(private submissionsService: SubmissionsService) {}

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
    if (sub.totalTestCases === 0) return 0;
    return Math.round((sub.passedTestCases / sub.totalTestCases) * 100);
  }

  /**
   * Check if submission is final
   */
  isFinal(): boolean {
    return this.submissionsService.isSubmissionFinal(this.submission().status);
  }
}
