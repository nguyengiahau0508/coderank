import { Module } from '@nestjs/common';
import { CoderankProblemsApiService } from './coderank-problems-api.service';

@Module({
  providers: [CoderankProblemsApiService],
  exports: [CoderankProblemsApiService],
})
export class ApiModule {}
