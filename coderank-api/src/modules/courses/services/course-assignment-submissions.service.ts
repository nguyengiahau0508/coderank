import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { CourseAssignmentSubmissionsEntity } from '../entities/course-assignment-submissions.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CourseAssignmentSubmissionsService extends BaseService<CourseAssignmentSubmissionsEntity> {
  constructor(
    @InjectRepository(CourseAssignmentSubmissionsEntity)
    protected readonly repository: Repository<CourseAssignmentSubmissionsEntity>,
  ) {
    super(repository);
  }
}
