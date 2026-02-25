import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { CourseEnrollmentsEntity } from '../entities/course-enrollments.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CourseEnrollmentsService extends BaseService<CourseEnrollmentsEntity> {
  constructor(
    @InjectRepository(CourseEnrollmentsEntity)
    protected readonly repository: Repository<CourseEnrollmentsEntity>,
  ) {
    super(repository);
  }
}
