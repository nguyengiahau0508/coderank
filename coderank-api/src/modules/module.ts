import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { RunnerModule } from './runner/runner.module';
import { ProblemsModule } from './problems/problems.module';
import { ContestsModule } from './contests/contests.module';
import { CoursesModule } from './courses/courses.module';
import { AgentModule } from './agent/agent.module';
import { AiFeaturesModule } from './ai-features/ai-features.module';

@Module({
  imports: [
    AgentModule,
    AiFeaturesModule,
    UsersModule,
    RunnerModule,
    ProblemsModule,
    ContestsModule,
    CoursesModule,
  ],
})
export class RootModule {}
