import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { CourseQuizzesEntity } from '../entities/course-quizzes.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CourseQuizzesService extends BaseService<CourseQuizzesEntity> {
  constructor(
    @InjectRepository(CourseQuizzesEntity)
    protected readonly repository: Repository<CourseQuizzesEntity>,
  ) {
    super(repository);
  }
}
