import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { ContestParticipantsEntity } from '../entities/contest-participants.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContestsEntity } from '../entities/contests.entity';
import { ContestSubmissionsEntity } from '../entities/contest-submissions.entity';
import { ContestProblemsEntity } from '../entities/contest-problems.entity';
import {
  ContestStatusEnum,
  SubmissionStatusEnum,
} from 'src/common/enums/enums';
import { ContestLeaderboardGateway } from '../gateways/contest-leaderboard.gateway';

@Injectable()
export class ContestParticipantsService extends BaseService<ContestParticipantsEntity> {
  constructor(
    @InjectRepository(ContestParticipantsEntity)
    protected readonly repository: Repository<ContestParticipantsEntity>,
    @InjectRepository(ContestsEntity)
    private readonly contestsRepository: Repository<ContestsEntity>,
    @InjectRepository(ContestSubmissionsEntity)
    private readonly contestSubmissionsRepository: Repository<ContestSubmissionsEntity>,
    @InjectRepository(ContestProblemsEntity)
    private readonly contestProblemsRepository: Repository<ContestProblemsEntity>,
    private readonly contestLeaderboardGateway: ContestLeaderboardGateway,
  ) {
    super(repository);
  }

  async joinContest(userId: string, contestId: string, password?: string) {
    // Check if contest exists
    const contest = await this.contestsRepository.findOne({
      where: { id: contestId },
    });

    if (!contest) {
      throw new NotFoundException('Contest not found');
    }

    if (
      contest.status === ContestStatusEnum.Draft ||
      contest.status === ContestStatusEnum.Ended
    ) {
      throw new BadRequestException(
        'Không thể đăng ký khi cuộc thi chưa mở hoặc đã kết thúc',
      );
    }

    // Check password if contest is private
    if (!contest.isPublic && contest.password !== password) {
      throw new BadRequestException('Invalid password');
    }

    // Check if already joined
    const existing = await this.repository.findOne({
      where: { userId, contestId },
    });

    if (existing) {
      throw new BadRequestException('Already joined this contest');
    }

    // Check max participants
    if (contest.maxParticipants && contest.maxParticipants > 0) {
      const participantCount = await this.repository.count({
        where: { contestId },
      });

      if (participantCount >= contest.maxParticipants) {
        throw new BadRequestException('Contest is full');
      }
    }

    const participant = await this.repository.save({
      userId,
      contestId,
      joinedAt: new Date(),
      totalScore: 0,
      solvedProblems: 0,
      isFinalized: false,
    });

    await this.recalculateLeaderboard(contestId);
    await this.emitLeaderboardUpdate(contestId);

    return participant;
  }

  async getLeaderboard(contestId: string) {
    return this.repository.find({
      where: { contestId },
      relations: { user: true },
      order: {
        rank: 'ASC',
        totalScore: 'DESC',
        penaltyMinutes: 'ASC',
      },
    });
  }

  async getMyParticipation(userId: string, contestId: string) {
    return this.repository.findOne({
      where: { userId, contestId },
      relations: { user: true },
    });
  }

  async leaveContest(userId: string, contestId: string) {
    // Check if contest exists
    const contest = await this.contestsRepository.findOne({
      where: { id: contestId },
    });

    if (!contest) {
      throw new NotFoundException('Contest not found');
    }

    // Only allow leaving if contest hasn't started yet (upcoming/draft)
    if (contest.status === ContestStatusEnum.Running) {
      throw new BadRequestException(
        'Không thể hủy đăng ký khi cuộc thi đang diễn ra',
      );
    }

    if (contest.status === ContestStatusEnum.Ended) {
      throw new BadRequestException(
        'Không thể hủy đăng ký khi cuộc thi đã kết thúc',
      );
    }

    // Find participation
    const participant = await this.repository.findOne({
      where: { userId, contestId },
    });

    if (!participant) {
      throw new BadRequestException('Bạn chưa đăng ký cuộc thi này');
    }

    await this.repository.remove(participant);

    await this.recalculateLeaderboard(contestId);
    await this.emitLeaderboardUpdate(contestId);

    return { message: 'Đã hủy đăng ký thành công' };
  }

  async recalculateLeaderboard(contestId: string): Promise<void> {
    const contest = await this.contestsRepository.findOne({
      where: { id: contestId },
      select: ['id', 'startTime', 'status'],
    });

    if (!contest) {
      throw new NotFoundException('Contest not found');
    }

    const participants = await this.repository.find({
      where: { contestId },
    });

    if (participants.length === 0) {
      return;
    }

    const contestProblems = await this.contestProblemsRepository.find({
      where: { contestId },
      select: ['problemId', 'points'],
    });

    const pointsByProblemId = new Map<string, number>(
      contestProblems.map((problem) => [problem.problemId, problem.points]),
    );

    const submissions = await this.contestSubmissionsRepository.find({
      where: { contestId },
      select: ['userId', 'problemId', 'score', 'status', 'submittedAt'],
      order: { submittedAt: 'ASC' },
    });

    const submissionsByUser = new Map<
      string,
      Map<string, ContestSubmissionsEntity[]>
    >();
    for (const submission of submissions) {
      const userBucket =
        submissionsByUser.get(submission.userId) ??
        new Map<string, ContestSubmissionsEntity[]>();
      const problemBucket = userBucket.get(submission.problemId) ?? [];
      problemBucket.push(submission);
      userBucket.set(submission.problemId, problemBucket);
      submissionsByUser.set(submission.userId, userBucket);
    }

    const contestStartMs = new Date(contest.startTime).getTime();

    for (const participant of participants) {
      const userProblemSubmissions = submissionsByUser.get(participant.userId);
      if (!userProblemSubmissions) {
        participant.totalScore = 0;
        participant.solvedProblems = 0;
        participant.penaltyMinutes = 0;
        participant.isFinalized = contest.status === ContestStatusEnum.Ended;
        continue;
      }

      let totalScore = 0;
      let solvedProblems = 0;
      let penaltyMinutes = 0;

      for (const [
        problemId,
        problemSubmissions,
      ] of userProblemSubmissions.entries()) {
        const maxProblemPoints = pointsByProblemId.get(problemId) ?? 100;
        const bestWeightedScore = problemSubmissions.reduce(
          (maxScore, current) => {
            const weighted = Math.round(
              (current.score / 100) * maxProblemPoints,
            );
            return Math.max(maxScore, weighted);
          },
          0,
        );

        totalScore += bestWeightedScore;

        const acceptedSubmissions = problemSubmissions.filter(
          (submission) => submission.status === SubmissionStatusEnum.Accepted,
        );

        if (acceptedSubmissions.length > 0) {
          solvedProblems++;

          const firstAcceptedAt = new Date(
            acceptedSubmissions[0].submittedAt,
          ).getTime();
          const wrongAttemptsBeforeAccepted = problemSubmissions.filter(
            (submission) => {
              if (submission.status === SubmissionStatusEnum.Accepted) {
                return false;
              }

              const submittedAtMs = new Date(submission.submittedAt).getTime();
              return submittedAtMs <= firstAcceptedAt;
            },
          ).length;

          const minutesFromStart = Math.max(
            0,
            Math.floor((firstAcceptedAt - contestStartMs) / 60000),
          );

          penaltyMinutes += minutesFromStart + wrongAttemptsBeforeAccepted * 20;
        }
      }

      participant.totalScore = totalScore;
      participant.solvedProblems = solvedProblems;
      participant.penaltyMinutes = penaltyMinutes;
      participant.isFinalized = contest.status === ContestStatusEnum.Ended;
    }

    const sortedParticipants = [...participants].sort((a, b) => {
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }

      if (b.solvedProblems !== a.solvedProblems) {
        return b.solvedProblems - a.solvedProblems;
      }

      const aPenalty = a.penaltyMinutes ?? 0;
      const bPenalty = b.penaltyMinutes ?? 0;
      if (aPenalty !== bPenalty) {
        return aPenalty - bPenalty;
      }

      const aJoined = a.joinedAt ? new Date(a.joinedAt).getTime() : 0;
      const bJoined = b.joinedAt ? new Date(b.joinedAt).getTime() : 0;
      return aJoined - bJoined;
    });

    let lastRank = 0;
    let previousSignature: string | null = null;
    for (let index = 0; index < sortedParticipants.length; index++) {
      const participant = sortedParticipants[index];
      const signature = `${participant.totalScore}|${participant.solvedProblems}|${participant.penaltyMinutes ?? 0}`;

      if (signature !== previousSignature) {
        lastRank = index + 1;
        previousSignature = signature;
      }

      participant.rank = lastRank;
    }

    await this.repository.save(sortedParticipants);
  }

  async emitLeaderboardUpdate(contestId: string): Promise<void> {
    const leaderboard = await this.getLeaderboard(contestId);
    this.contestLeaderboardGateway.notifyLeaderboardUpdated(
      contestId,
      leaderboard,
    );
  }
}
