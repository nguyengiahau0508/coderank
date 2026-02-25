import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { CourseAssignmentsEntity } from '../entities/course-assignments.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CourseAssignmentsService extends BaseService<CourseAssignmentsEntity> {
  constructor(
    @InjectRepository(CourseAssignmentsEntity)
    protected readonly repository: Repository<CourseAssignmentsEntity>,
  ) {
    super(repository);
  }
}
