import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { CourseAssignmentSubmissionsEntity } from '../entities/course-assignment-submissions.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

@Injectable()
export class CourseAssignmentSubmissionsService extends BaseService<CourseAssignmentSubmissionsEntity> {
  constructor(
    @InjectRepository(CourseAssignmentSubmissionsEntity)
    protected readonly repository: Repository<CourseAssignmentSubmissionsEntity>,
  ) {
    super(repository);
  }

  async getSubmissionsForAiGrading(options: {
    assignmentId: string;
    submissionIds?: string[];
    forceRegrade?: boolean;
  }): Promise<CourseAssignmentSubmissionsEntity[]> {
    const { assignmentId, submissionIds, forceRegrade = false } = options;

    if (submissionIds && submissionIds.length > 0) {
      const where: Record<string, unknown> = {
        assignmentId,
        id: In(submissionIds),
      };

      if (!forceRegrade) {
        where.status = In(['submitted', 'late', 'returned']);
      }

      return this.repository.find({
        where: where as any,
        order: { submittedAt: 'DESC' },
      });
    }

    const qb = this.repository
      .createQueryBuilder('s')
      .innerJoin(
        (subQuery) =>
          subQuery
            .select('MAX(s2.attemptNumber)', 'maxAttemptNumber')
            .addSelect('s2.authorId', 'authorId')
            .from(CourseAssignmentSubmissionsEntity, 's2')
            .where('s2.assignmentId = :assignmentId', { assignmentId })
            .groupBy('s2.authorId'),
        'latest',
        'latest.authorId = s.authorId AND latest.maxAttemptNumber = s.attemptNumber',
      )
      .where('s.assignmentId = :assignmentId', { assignmentId });

    if (!forceRegrade) {
      qb.andWhere('s.status IN (:...statuses)', {
        statuses: ['submitted', 'late', 'returned'],
      });
    }

    return qb.orderBy('s.submittedAt', 'DESC').getMany();
  }
}
