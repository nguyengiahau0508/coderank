import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { CourseLessonProblemsEntity } from '../entities/course-lesson-problems.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CourseLessonProblemsService extends BaseService<CourseLessonProblemsEntity> {
  constructor(
    @InjectRepository(CourseLessonProblemsEntity)
    protected readonly repository: Repository<CourseLessonProblemsEntity>,
  ) {
    super(repository);
  }
}
