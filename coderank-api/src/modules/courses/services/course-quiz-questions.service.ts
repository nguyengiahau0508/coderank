import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { CourseQuizQuestionsEntity } from '../entities/course-quiz-questions.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CourseQuizQuestionsService extends BaseService<CourseQuizQuestionsEntity> {
  constructor(
    @InjectRepository(CourseQuizQuestionsEntity)
    protected readonly repository: Repository<CourseQuizQuestionsEntity>,
  ) {
    super(repository);
  }
}
