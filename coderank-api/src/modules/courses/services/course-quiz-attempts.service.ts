import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { CourseQuizAttemptsEntity } from '../entities/course-quiz-attempts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CourseQuizAttemptsService extends BaseService<CourseQuizAttemptsEntity> {
  constructor(
    @InjectRepository(CourseQuizAttemptsEntity)
    protected readonly repository: Repository<CourseQuizAttemptsEntity>,
  ) {
    super(repository);
  }
}
