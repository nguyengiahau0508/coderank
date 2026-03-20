import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContestParticipantsEntity } from './entities/contest-participants.entity';
import { ContestProblemsEntity } from './entities/contest-problems.entity';
import { ContestSubmissionsEntity } from './entities/contest-submissions.entity';
import { ContestsEntity } from './entities/contests.entity';
import { ContestsService } from './services/contests.service';
import { ContestParticipantsService } from './services/contest-participants.service';
import { ContestProblemsService } from './services/contest-problems.service';
import { ContestSubmissionsService } from './services/contest-submissions.service';
import { ContestsController } from './contests.controller';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContestParticipantsEntity,
      ContestProblemsEntity,
      ContestSubmissionsEntity,
      ContestsEntity,
    ]),
  ],
  providers: [
    ContestsService,
    ContestParticipantsService,
    ContestProblemsService,
    ContestSubmissionsService,
  ],
  controllers: [ContestsController],
})
export class ContestsModule {}
