import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { RunnerService } from "../services/runner.service";
import { CheckerService } from "../services/checker.service";
import { ICheckResult } from "src/common/interfaces/interfaces";
import { SubmissionStatusEnum, TestcaseCompareTypeEnum } from "src/common/enums/enums";
import { RunStatusEnum } from "../dto/run-result.dto";
import { SubmissionCompletedEvent } from "../events/submission-completed.event";

@Processor('runner-queue')
export class RunnerProcessor extends WorkerHost {
  private readonly logger = new Logger(RunnerProcessor.name);

  constructor(
    private readonly runnerService: RunnerService,
    private readonly checkerService: CheckerService,
    private readonly eventEmitter: EventEmitter2,
  ) { super(); }

  async process(job: Job) {
    const { submissionId, language, testcases, code, timeLimitMs, memoryLimitMb } = job.data;
    if (!submissionId || !language || !testcases || !code || timeLimitMs == null || memoryLimitMb == null) {
      throw new Error('Invalid job data');
    }
    if (!Array.isArray(testcases) || testcases.length === 0) {
      throw new Error('Testcases must be a non-empty array');
    }

    this.logger.log(`Processing submission ${submissionId} with ${testcases.length} testcases`);

    try {
      let passedCount = 0;
      let totalTime = 0;
      let maxMemory = 0;
      let finalStatus = SubmissionStatusEnum.Accepted;
      let errorMessage: string | undefined;
      let failedOutput: string | undefined;

      // Run code for each testcase
      for (let i = 0; i < testcases.length; i++) {
        const testcase = testcases[i];
        this.logger.debug(`Running testcase ${i + 1}/${testcases.length}`);

        const result = await this.runnerService.runCode({
          language,
          code,
          input: testcase.input,
          timeLimit: timeLimitMs,
          memoryLimit: memoryLimitMb,
        });

        totalTime = Math.max(totalTime, result.time);
        maxMemory = Math.max(maxMemory, result.memory);

        // Check for runtime errors
        if (result.status === RunStatusEnum.TLE) {
          finalStatus = SubmissionStatusEnum.TimeLimitExceeded;
          errorMessage = 'Time limit exceeded';
          break;
        }

        if (result.status === RunStatusEnum.MLE) {
          finalStatus = SubmissionStatusEnum.MemoryLimitExceeded;
          errorMessage = 'Memory limit exceeded';
          break;
        }

        if (result.status === RunStatusEnum.RE) {
          finalStatus = SubmissionStatusEnum.RuntimeError;
          errorMessage = result.stderr || 'Runtime error';
          break;
        }

        if (result.status === RunStatusEnum.CE) {
          finalStatus = SubmissionStatusEnum.CompilationError;
          errorMessage = result.stderr || 'Compilation error';
          break;
        }

        // Check output correctness
        const checkResult: ICheckResult = this.checkerService.check(
          result.stdout,
          testcase.expectedOutput,
          testcase.compareType || TestcaseCompareTypeEnum.TrimWhitespace,
        );

        if (checkResult.passed) {
          passedCount++;
        } else {
          finalStatus = SubmissionStatusEnum.WrongAnswer;
          errorMessage = checkResult.message || 'Wrong answer';
          failedOutput = `Expected:\n${checkResult.expectedOutput}\n\nGot:\n${checkResult.actualOutput}`;
          break;
        }
      }

      // Calculate score (percentage of passed testcases)
      const score = Math.round((passedCount / testcases.length) * 100);

      // Emit event with results
      const event = new SubmissionCompletedEvent(
        submissionId,
        finalStatus,
        score,
        passedCount,
        testcases.length,
        totalTime,
        maxMemory,
        errorMessage,
        failedOutput,
      );

      this.eventEmitter.emit('submission.completed', event);

      this.logger.log(
        `Submission ${submissionId} completed: ${finalStatus} (${passedCount}/${testcases.length} passed)`,
      );
    } catch (error) {
      this.logger.error(`Error processing submission ${submissionId}:`, error);

      // Emit error event
      const errorEvent = new SubmissionCompletedEvent(
        submissionId,
        SubmissionStatusEnum.SystemError,
        0,
        0,
        testcases.length,
        0,
        0,
        error.message || 'System error',
      );

      this.eventEmitter.emit('submission.completed', errorEvent);
      throw error;
    }
  }
}
