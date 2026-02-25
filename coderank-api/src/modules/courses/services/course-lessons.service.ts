import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { CourseLessonsEntity } from '../entities/course-lessons.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CourseLessonsService extends BaseService<CourseLessonsEntity> {
  constructor(
    @InjectRepository(CourseLessonsEntity)
    protected readonly repository: Repository<CourseLessonsEntity>,
  ) {
    super(repository);
  }
}
