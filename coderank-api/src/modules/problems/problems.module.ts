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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProblemsEntity,
      TestcasesEntity,
      TagsEntity,
      HintsEntity,
      SubmissionsEntity,
    ]),
  ],
  controllers: [ProblemsController],
  providers: [ProblemsService, TestcasesService, TagsService, HintsService],
  exports: [],
})
export class ProblemsModule {}
