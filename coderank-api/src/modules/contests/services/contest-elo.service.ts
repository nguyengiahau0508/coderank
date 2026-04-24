import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolesEnum } from 'src/common/enums/enums';
import { ContestsEntity } from '../entities/contests.entity';
import { ContestParticipantsEntity } from '../entities/contest-participants.entity';
import { UsersEntity } from 'src/modules/users/entities/user.entity';

interface EloParticipant {
  id: string;
  userId: string;
  oldRating: number;
  actualRank: number;
}

@Injectable()
export class ContestEloService {
  private readonly logger = new Logger(ContestEloService.name);

  private static readonly INITIAL_ELO = 1400;
  private static readonly K_FACTOR = 40;

  constructor(
    @InjectRepository(ContestsEntity)
    private readonly contestsRepository: Repository<ContestsEntity>,
    @InjectRepository(ContestParticipantsEntity)
    private readonly contestParticipantsRepository: Repository<ContestParticipantsEntity>,
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
  ) {}

  async calculateForContest(contestId: string): Promise<void> {
    const contest = await this.contestsRepository.findOne({
      where: { id: contestId },
      select: ['id', 'isRated'],
    });

    if (!contest || !contest.isRated) {
      return;
    }

    const participants = await this.contestParticipantsRepository.find({
      where: { contestId },
      relations: { user: true },
      order: {
        totalScore: 'DESC',
        solvedProblems: 'DESC',
        penaltyMinutes: 'ASC',
        joinedAt: 'ASC',
      },
    });

    const studentParticipants = participants.filter((participant) =>
      participant.user?.roles?.includes(RolesEnum.Student),
    );

    if (studentParticipants.length === 0) {
      this.logger.log(
        `Contest ${contestId} has no student participants for Elo calculation`,
      );
      return;
    }

    const snapshots: EloParticipant[] = studentParticipants.map(
      (participant, index) => {
        const oldRating = Number(
          participant.user?.eloRating ?? ContestEloService.INITIAL_ELO,
        );
        return {
          id: participant.id,
          userId: participant.userId,
          oldRating,
          actualRank: index + 1,
        };
      },
    );

    const totalParticipants = snapshots.length;

    const participantUpdates = snapshots.map((snapshot, idx) => {
      const expectedPerformanceIndicator =
        this.calculateExpectedPerformanceIndicator(
          snapshot.oldRating,
          snapshots,
          idx,
        );

      const ratingDelta =
        (ContestEloService.K_FACTOR *
          (expectedPerformanceIndicator - snapshot.actualRank)) /
        totalParticipants;

      const newRating = Math.max(
        0,
        Math.round(snapshot.oldRating + ratingDelta),
      );

      return {
        participantId: snapshot.id,
        userId: snapshot.userId,
        oldRating: snapshot.oldRating,
        expectedPerformanceIndicator: Number(
          expectedPerformanceIndicator.toFixed(4),
        ),
        actualRank: snapshot.actualRank,
        ratingDelta: Number(ratingDelta.toFixed(4)),
        newRating,
      };
    });

    await this.contestParticipantsRepository.manager.transaction(
      async (manager) => {
        for (const update of participantUpdates) {
          await manager.update(
            ContestParticipantsEntity,
            update.participantId,
            {
              oldRating: update.oldRating,
              expectedPerformanceIndicator: update.expectedPerformanceIndicator,
              actualRank: update.actualRank,
              ratingDelta: update.ratingDelta,
              newRating: update.newRating,
            },
          );

          await manager.update(UsersEntity, update.userId, {
            eloRating: update.newRating,
          });
        }
      },
    );

    this.logger.log(
      `Calculated Elo for contest ${contestId} with ${participantUpdates.length} participants`,
    );
  }

  private calculateExpectedPerformanceIndicator(
    currentOldRating: number,
    participants: EloParticipant[],
    currentIndex: number,
  ): number {
    let result = 1;

    for (let i = 0; i < participants.length; i++) {
      if (i === currentIndex) {
        continue;
      }

      const opponentOldRating = participants[i].oldRating;
      const expectedScoreAgainstOpponent =
        1 / (1 + 10 ** ((opponentOldRating - currentOldRating) / 400));
      result += expectedScoreAgainstOpponent;
    }

    return result;
  }
}
