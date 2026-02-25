import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { CourseLessonProgressEntity } from '../entities/course-lesson-progress.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CourseLessonProgressService extends BaseService<CourseLessonProgressEntity> {
  constructor(
    @InjectRepository(CourseLessonProgressEntity)
    protected readonly repository: Repository<CourseLessonProgressEntity>,
  ) {
    super(repository);
  }
}
