import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { BaseService } from "src/common/services/base.service";
import { ContestParticipantsEntity } from "../entities/contest-participants.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ContestsEntity } from "../entities/contests.entity";


@Injectable()
export class ContestParticipantsService extends BaseService<ContestParticipantsEntity> {
  constructor(
    @InjectRepository(ContestParticipantsEntity) 
    protected readonly repository: Repository<ContestParticipantsEntity>,
    @InjectRepository(ContestsEntity)
    private readonly contestsRepository: Repository<ContestsEntity>,
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

    return this.repository.save({
      userId,
      contestId,
      joinedAt: new Date(),
      totalScore: 0,
      solvedProblems: 0,
      isFinalized: false,
    });
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
}
