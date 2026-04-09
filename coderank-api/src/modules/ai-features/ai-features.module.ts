import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiFeaturesController } from './ai-features.controller';
import { 
  AiHintsService, 
  CodeReviewsService,
  UserSkillProfilesService,
  LearningPathsService,
  TestcaseGeneratorService,
  ClassAnalyticsService,
  AiGradingService,
} from './services';
import { 
  AiHintsEntity, 
  CodeReviewsEntity, 
  PlagiarismReportsEntity,
  UserSkillProfilesEntity,
  LearningPathsEntity,
  AiGeneratedTestcasesEntity,
  ClassAnalyticsEntity,
  AiGradingsEntity,
} from './entities';
import { AgentModule } from '../agent/agent.module';
import { ProblemsModule } from '../problems/problems.module';
import { CoursesModule } from '../courses/courses.module';
import { SubmissionsEntity } from '../problems/entities/submissions.entity';
import { ProblemsEntity } from '../problems/entities/problems.entity';
import { CoursesEntity } from '../courses/entities/courses.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AiHintsEntity,
      CodeReviewsEntity,
      PlagiarismReportsEntity,
      UserSkillProfilesEntity,
      LearningPathsEntity,
      AiGeneratedTestcasesEntity,
      ClassAnalyticsEntity,
      AiGradingsEntity,
      SubmissionsEntity,
      ProblemsEntity,
      CoursesEntity,
    ]),
    AgentModule,
    ProblemsModule,
    CoursesModule,
  ],
  controllers: [AiFeaturesController],
  providers: [
    AiHintsService, 
    CodeReviewsService,
    UserSkillProfilesService,
    LearningPathsService,
    TestcaseGeneratorService,
    ClassAnalyticsService,
    AiGradingService,
  ],
  exports: [
    AiHintsService, 
    CodeReviewsService,
    UserSkillProfilesService,
    LearningPathsService,
    TestcaseGeneratorService,
    ClassAnalyticsService,
    AiGradingService,
  ],
})
export class AiFeaturesModule {}
