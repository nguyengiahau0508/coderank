import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { CourseReviewsEntity } from '../entities/course-reviews.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CourseReviewsService extends BaseService<CourseReviewsEntity> {
  constructor(
    @InjectRepository(CourseReviewsEntity)
    protected readonly repository: Repository<CourseReviewsEntity>,
  ) {
    super(repository);
  }
}
