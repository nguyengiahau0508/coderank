import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { ContestSubmissionsEntity } from '../entities/contest-submissions.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContestSubmissionDto } from '../dto/contest-submissions/create-contest-submission.dto';
import {
  ContestStatusEnum,
  SubmissionStatusEnum,
} from 'src/common/enums/enums';
import { ContestParticipantsEntity } from '../entities/contest-participants.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ContestProblemsEntity } from '../entities/contest-problems.entity';
import { ContestsEntity } from '../entities/contests.entity';
import { ProblemsEntity } from 'src/modules/problems/entities/problems.entity';
import { TestcasesEntity } from 'src/modules/problems/entities/testcases.entity';
import { SubmissionCompletedEvent } from 'src/modules/runner/events/submission-completed.event';
import { ContestParticipantsService } from './contest-participants.service';

@Injectable()
export class ContestSubmissionsService extends BaseService<ContestSubmissionsEntity> {
  constructor(
    @InjectQueue('runner-queue') private readonly judgeQueue: Queue,
    @InjectRepository(ContestSubmissionsEntity)
    protected readonly repository: Repository<ContestSubmissionsEntity>,
    @InjectRepository(ContestParticipantsEntity)
    private readonly participantsRepository: Repository<ContestParticipantsEntity>,
    @InjectRepository(ContestProblemsEntity)
    private readonly contestProblemsRepository: Repository<ContestProblemsEntity>,
    @InjectRepository(ContestsEntity)
    private readonly contestsRepository: Repository<ContestsEntity>,
    @InjectRepository(ProblemsEntity)
    private readonly problemsRepository: Repository<ProblemsEntity>,
    @InjectRepository(TestcasesEntity)
    private readonly testcasesRepository: Repository<TestcasesEntity>,
    private readonly contestParticipantsService: ContestParticipantsService,
  ) {
    super(repository);
  }

  async submit(
    userId: string,
    contestId: string,
    problemId: string,
    dto: CreateContestSubmissionDto,
  ) {
    const contest = await this.contestsRepository.findOne({
      where: { id: contestId },
      select: ['id', 'status'],
    });

    if (!contest) {
      throw new NotFoundException('Contest not found');
    }

    if (contest.status !== ContestStatusEnum.Running) {
      throw new BadRequestException('Contest is not running');
    }

    // Check if user is a participant
    const participant = await this.participantsRepository.findOne({
      where: { userId, contestId },
    });

    if (!participant) {
      throw new BadRequestException('You must join the contest first');
    }

    const contestProblem = await this.contestProblemsRepository.findOne({
      where: { contestId, problemId },
      select: ['id'],
    });

    if (!contestProblem) {
      throw new BadRequestException('Problem is not part of this contest');
    }

    const problem = await this.problemsRepository.findOne({
      where: { id: problemId },
      select: ['id', 'memoryLimitMb', 'timeLimitMs'],
    });

    if (!problem) {
      throw new NotFoundException('Problem not found');
    }

    const testcases = await this.testcasesRepository
      .createQueryBuilder('testcase')
      .select([
        'testcase.input',
        'testcase.expectedOutput',
        'testcase.compareType',
      ])
      .where('testcase.problemId = :problemId', { problemId })
      .orderBy('testcase.testcaseOrder', 'ASC')
      .getMany();

    if (testcases.length === 0) {
      throw new BadRequestException('Problem has no testcases');
    }

    const submission = await this.repository.save({
      userId,
      contestId,
      problemId,
      code: dto.code,
      language: dto.language,
      status: SubmissionStatusEnum.Pending,
      score: 0,
      passedTestcases: 0,
      totalTestcases: 0,
      submittedAt: new Date(),
    });

    await this.judgeQueue.add('runner-queue', {
      submissionId: submission.id,
      source: 'contest',
      contestId,
      userId,
      problemId,
      language: dto.language,
      code: dto.code,
      timeLimitMs: problem.timeLimitMs,
      memoryLimitMb: problem.memoryLimitMb,
      testcases: testcases.map((testcase) => ({
        input: testcase.input,
        expectedOutput: testcase.expectedOutput,
        compareType: testcase.compareType,
      })),
    });

    return submission;
  }

  async getAllSubmissionsByContestId(contestId: string) {
    return this.repository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.user', 'user')
      .leftJoinAndSelect('submission.problem', 'problem')
      .where('submission.contestId = :contestId', { contestId })
      .addSelect('user.email')
      .orderBy('submission.submittedAt', 'DESC')
      .getMany();
  }

  async handleSubmissionCompleted(
    event: SubmissionCompletedEvent,
  ): Promise<void> {
    if (event.source !== 'contest') {
      return;
    }

    const submission = await this.repository.findOne({
      where: { id: event.submissionId },
      select: ['id', 'contestId', 'problemId'],
    });

    if (!submission) {
      return;
    }

    const contestProblem = await this.contestProblemsRepository.findOne({
      where: {
        contestId: submission.contestId,
        problemId: submission.problemId,
      },
      select: ['points'],
    });

    const maxPoints = contestProblem?.points ?? 100;
    const weightedScore = Math.round((event.score / 100) * maxPoints);

    await this.repository.update(submission.id, {
      status: event.status,
      score: weightedScore,
      passedTestcases: event.passedTestcases,
      totalTestcases: event.totalTestcases,
      executionTimeMs: event.executionTimeMs,
      memoryUsedMb: event.memoryUsedMb,
      errorMessage: event.errorMessage,
    });

    await this.contestParticipantsService.recalculateLeaderboard(
      submission.contestId,
    );
    await this.contestParticipantsService.emitLeaderboardUpdate(
      submission.contestId,
    );
  }
}
