import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ContestParticipantsEntity } from './entities/contest-participants.entity';
import { ContestProblemsEntity } from './entities/contest-problems.entity';
import { ContestSubmissionsEntity } from './entities/contest-submissions.entity';
import { ContestsEntity } from './entities/contests.entity';
import { ContestsService } from './services/contests.service';
import { ContestParticipantsService } from './services/contest-participants.service';
import { ContestProblemsService } from './services/contest-problems.service';
import { ContestSubmissionsService } from './services/contest-submissions.service';
import { ContestsController } from './contests.controller';
import { ProblemsEntity } from '../problems/entities/problems.entity';
import { TestcasesEntity } from '../problems/entities/testcases.entity';
import { ContestSubmissionCompletedListener } from './listeners/contest-submission-completed.listener';
import { ContestLeaderboardGateway } from './gateways/contest-leaderboard.gateway';
import { UsersEntity } from '../users/entities/user.entity';
import { ContestEloService } from './services/contest-elo.service';
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'runner-queue',
    }),
    TypeOrmModule.forFeature([
      ContestParticipantsEntity,
      ContestProblemsEntity,
      ContestSubmissionsEntity,
      ContestsEntity,
      ProblemsEntity,
      TestcasesEntity,
      UsersEntity,
    ]),
  ],
  providers: [
    ContestsService,
    ContestParticipantsService,
    ContestProblemsService,
    ContestSubmissionsService,
    ContestEloService,
    ContestSubmissionCompletedListener,
    ContestLeaderboardGateway,
  ],
  controllers: [ContestsController],
})
export class ContestsModule {}
