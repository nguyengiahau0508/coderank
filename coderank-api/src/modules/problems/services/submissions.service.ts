import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { SubmissionsEntity } from '../entities/submissions.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSubmissionDto } from '../dto/submission';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { TestcasesService } from './testcases.service';
import { ProblemsService } from './problems.service';

@Injectable()
export class SubmissionsService extends BaseService<SubmissionsEntity> {
  constructor(
    @InjectQueue('runner-queue') private judgeQueue: Queue,
    @InjectRepository(SubmissionsEntity)
    protected readonly submissionRepository: Repository<SubmissionsEntity>,
    private readonly testcasesService: TestcasesService,
    private readonly problemsService: ProblemsService,
  ) {
    super(submissionRepository);
  }

  async submit(userId: string, problemId: string, dto: CreateSubmissionDto) {
    const submissionCreated = this.submissionRepository.create({
      authorId: userId,
      problemId: problemId,
      code: dto.code,
      language: dto.language,
    });
    const submissionSaved =
      await this.submissionRepository.save(submissionCreated);

    const problem = await this.problemsService.findOne({
      where: { id: problemId },
      select: ['memoryLimitMb', 'timeLimitMs'],
    });
    if (!problem) {
      throw new Error('Problem not found');
    }

    const testcases = await this.testcasesService.find({
      where: { problemId },
      select: ['input', 'expectedOutput', 'compareType'],
    });
    await this.judgeQueue.add('runner-queue', {
      submissionId: submissionSaved.id,
      language: dto.language,
      testcases: testcases.map((tc) => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        compareType: tc.compareType,
      })),
      timeLimitMs: problem.timeLimitMs,
      memoryLimitMb: problem.memoryLimitMb,
      code: dto.code,
    });

    return submissionSaved;
  }
}
