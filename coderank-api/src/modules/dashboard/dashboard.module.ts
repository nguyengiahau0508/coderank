import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { UsersEntity } from '../users/entities/user.entity';
import { CourseEnrollmentsEntity } from '../courses/entities/course-enrollments.entity';
import { ContestsEntity } from '../contests/entities/contests.entity';
import { ContestParticipantsEntity } from '../contests/entities/contest-participants.entity';
import { AiFeaturesModule } from '../ai-features/ai-features.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersEntity,
      CourseEnrollmentsEntity,
      ContestsEntity,
      ContestParticipantsEntity,
    ]),
    AiFeaturesModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
