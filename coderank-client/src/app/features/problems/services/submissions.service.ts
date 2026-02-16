import { Injectable, signal } from '@angular/core';
import { SubmissionsModel } from '../../../data/models/submissions.model';
import { SubmissionStatusEnum } from '../../../data/enums/enums';

/**
 * Submissions Service - Manage submission state and results
 */
@Injectable({
  providedIn: 'root'
})
export class SubmissionsService {
  // Current submission being processed
  private readonly currentSubmission = signal<SubmissionsModel | null>(null);
  readonly currentSubmission$ = this.currentSubmission.asReadonly();

  // Loading state
  private readonly isSubmitting = signal<boolean>(false);
  readonly isSubmitting$ = this.isSubmitting.asReadonly();

  /**
   * Set current submission
   */
  setCurrentSubmission(submission: SubmissionsModel | null): void {
    this.currentSubmission.set(submission);
  }

  /**
   * Set submitting state
   */
  setSubmitting(value: boolean): void {
    this.isSubmitting.set(value);
  }

  /**
   * Clear current submission
   */
  clearSubmission(): void {
    this.currentSubmission.set(null);
    this.isSubmitting.set(false);
  }

  /**
   * Check if submission is final (completed, not pending/running)
   */
  isSubmissionFinal(status: SubmissionStatusEnum): boolean {
    return ![SubmissionStatusEnum.Pending, SubmissionStatusEnum.Running].includes(status);
  }

  /**
   * Get status display label
   */
  getStatusLabel(status: SubmissionStatusEnum): string {
    const labels: Record<SubmissionStatusEnum, string> = {
      [SubmissionStatusEnum.Pending]: 'Đang chờ...',
      [SubmissionStatusEnum.Running]: 'Đang chạy...',
      [SubmissionStatusEnum.Accepted]: 'Accepted',
      [SubmissionStatusEnum.WrongAnswer]: 'Wrong Answer',
      [SubmissionStatusEnum.TimeLimitExceeded]: 'Time Limit Exceeded',
      [SubmissionStatusEnum.MemoryLimitExceeded]: 'Memory Limit Exceeded',
      [SubmissionStatusEnum.RuntimeError]: 'Runtime Error',
      [SubmissionStatusEnum.CompilationError]: 'Compilation Error',
      [SubmissionStatusEnum.SystemError]: 'System Error',
    };
    return labels[status];
  }

  /**
   * Get status severity for PrimeNG
   */
  getStatusSeverity(status: SubmissionStatusEnum): 'success' | 'danger' | 'warn' | 'info' {
    switch (status) {
      case SubmissionStatusEnum.Accepted:
        return 'success';
      case SubmissionStatusEnum.WrongAnswer:
      case SubmissionStatusEnum.RuntimeError:
      case SubmissionStatusEnum.CompilationError:
      case SubmissionStatusEnum.SystemError:
        return 'danger';
      case SubmissionStatusEnum.TimeLimitExceeded:
      case SubmissionStatusEnum.MemoryLimitExceeded:
        return 'warn';
      case SubmissionStatusEnum.Pending:
      case SubmissionStatusEnum.Running:
        return 'info';
      default:
        return 'info';
    }
  }
}
