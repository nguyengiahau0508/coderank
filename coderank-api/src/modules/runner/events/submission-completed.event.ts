import { SubmissionStatusEnum } from 'src/common/enums/enums';

export class SubmissionCompletedEvent {
  constructor(
    public readonly submissionId: string,
    public readonly status: SubmissionStatusEnum,
    public readonly score: number,
    public readonly passedTestcases: number,
    public readonly totalTestcases: number,
    public readonly executionTimeMs: number,
    public readonly memoryUsedMb: number,
    public readonly errorMessage?: string,
    public readonly output?: string,
  ) {}
}
