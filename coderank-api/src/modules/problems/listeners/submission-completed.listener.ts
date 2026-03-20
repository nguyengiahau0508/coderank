import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubmissionsEntity } from '../entities/submissions.entity';
import { SubmissionCompletedEvent } from 'src/modules/runner/events/submission-completed.event';
import { SubmissionGateway } from '../gateways/submission.gateway';

@Injectable()
export class SubmissionCompletedListener {
  private readonly logger = new Logger(SubmissionCompletedListener.name);

  constructor(
    @InjectRepository(SubmissionsEntity)
    private readonly submissionRepository: Repository<SubmissionsEntity>,
    private readonly submissionGateway: SubmissionGateway,
  ) {}

  @OnEvent('submission.completed')
  async handleSubmissionCompleted(event: SubmissionCompletedEvent) {
    this.logger.log(
      `Handling submission completed event for submission ${event.submissionId}`,
    );

    try {
      await this.submissionRepository.update(event.submissionId, {
        status: event.status,
        score: event.score,
        passedTestcases: event.passedTestcases,
        totalTestcases: event.totalTestcases,
        executionTimeMs: event.executionTimeMs,
        memoryUsedMb: event.memoryUsedMb,
        errorMessage: event.errorMessage,
        output: event.output,
      });

      this.logger.log(
        `Updated submission ${event.submissionId}: ${event.status} (${event.passedTestcases}/${event.totalTestcases} passed)`,
      );

      // Notify the submission author via WebSocket
      const submission = await this.submissionRepository.findOne({
        where: { id: event.submissionId },
        select: ['id', 'authorId'],
      });

      if (submission?.authorId) {
        this.submissionGateway.notifySubmissionCompleted(submission.authorId, {
          submissionId: event.submissionId,
          status: event.status,
          score: event.score,
          passedTestcases: event.passedTestcases,
          totalTestcases: event.totalTestcases,
          executionTimeMs: event.executionTimeMs,
          memoryUsedMb: event.memoryUsedMb,
          errorMessage: event.errorMessage,
          output: event.output,
        });
      }
    } catch (error) {
      this.logger.error(
        `Failed to update submission ${event.submissionId}:`,
        error,
      );
      throw error;
    }
  }
}
