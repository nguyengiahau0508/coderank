import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProblemsEntity } from './entities/problems.entity';
import { TestcasesEntity } from './entities/testcases.entity';
import { TagsEntity } from './entities/tags.entity';
import { ProblemsController } from './problems.controller';
import { ProblemsService } from './services/problems.service';
import { TestcasesService } from './services/testcases.service';
import { TagsService } from './services/tags.service';
import { HintsEntity } from './entities/hints.entity';
import { HintsService } from './services/hints.service';
import { SubmissionsEntity } from './entities/submissions.entity';
import { SolutionsEntity } from './entities/solutions.entity';
import { BullModule } from '@nestjs/bullmq';
import { SubmissionsService } from './services/submissions.service';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { SubmissionCompletedListener } from './listeners/submission-completed.listener';
import { SolutionsService } from './services/solutions.service';
import { SubmissionGateway } from './gateways/submission.gateway';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProblemsEntity,
      TestcasesEntity,
      TagsEntity,
      HintsEntity,
      SubmissionsEntity,
      SolutionsEntity,
    ]),
    BullModule.registerQueue({
      name: 'runner-queue',
    }),
    BullBoardModule.forFeature({
      name: 'runner-queue',
      adapter: BullMQAdapter,
    }),
  ],
  controllers: [ProblemsController],
  providers: [
    ProblemsService,
    TestcasesService,
    TagsService,
    HintsService,
    SubmissionsService,
    SubmissionCompletedListener,
    SolutionsService,
    SubmissionGateway,
  ],
  exports: [ProblemsService],
})
export class ProblemsModule {}
