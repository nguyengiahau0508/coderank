import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SubmissionCompletedEvent } from 'src/modules/runner/events/submission-completed.event';
import { ContestSubmissionsService } from '../services/contest-submissions.service';

@Injectable()
export class ContestSubmissionCompletedListener {
  constructor(
    private readonly contestSubmissionsService: ContestSubmissionsService,
  ) {}

  @OnEvent('submission.completed')
  async handleSubmissionCompleted(event: SubmissionCompletedEvent) {
    await this.contestSubmissionsService.handleSubmissionCompleted(event);
  }
}
