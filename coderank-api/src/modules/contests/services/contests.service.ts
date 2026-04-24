import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { ContestsEntity } from '../entities/contests.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like } from 'typeorm';
import { PaginationQueryContestsDto } from '../dto/contests/pagination-query-contest.dto';
import { ContestStatusEnum } from 'src/common/enums/enums';
import { ContestParticipantsService } from './contest-participants.service';
import { ContestEloService } from './contest-elo.service';

@Injectable()
export class ContestsService extends BaseService<ContestsEntity> {
  constructor(
    @InjectRepository(ContestsEntity)
    protected readonly repository: Repository<ContestsEntity>,
    private readonly contestParticipantsService: ContestParticipantsService,
    private readonly contestEloService: ContestEloService,
  ) {
    super(repository);
  }

  async getContests(dto: PaginationQueryContestsDto) {
    const { page = 1, limit = 10, search, status, isPublic, isRated } = dto;

    const where: FindOptionsWhere<ContestsEntity> = {};

    if (status) {
      where.status = status;
    }

    if (isPublic !== undefined) {
      where.isPublic = isPublic;
    }

    if (isRated !== undefined) {
      where.isRated = isRated;
    }

    const searchWhere: FindOptionsWhere<ContestsEntity>[] = [];
    if (search) {
      searchWhere.push(
        { ...where, title: Like(`%${search}%`) },
        { ...where, slug: Like(`%${search}%`) },
      );
    }

    const [items, totalItems] = await this.repository.findAndCount({
      where: search ? searchWhere : where,
      order: {
        startTime: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      totalItems,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  async ensureContestRankCalculated(contestId: string): Promise<void> {
    const contest = await this.repository.findOne({
      where: { id: contestId },
      select: ['id', 'status', 'isRated', 'isRankCalculated'],
    });

    if (!contest) {
      return;
    }

    if (
      contest.status !== ContestStatusEnum.Ended ||
      contest.isRankCalculated
    ) {
      return;
    }

    await this.contestParticipantsService.recalculateLeaderboard(contestId);
    await this.contestEloService.calculateForContest(contestId);
    await this.repository.update(contestId, { isRankCalculated: true });
  }

  async markContestRankUncalculated(contestId: string): Promise<void> {
    await this.repository.update(contestId, { isRankCalculated: false });
  }
}
