import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { CourseAssignmentsEntity } from './course-assignments.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SubmissionStatusEnum {
  Submitted = 'submitted',
  Graded = 'graded',
  Returned = 'returned',
  Late = 'late',
}

export interface SubmissionFileInfo {
  fileId: string;
  filePath: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}

@Entity('course_assignment_submissions')
@Index('IDX_submission_assignment', ['assignmentId'])
@Index('IDX_submission_user', ['authorId'])
@Index('IDX_submission_unique', ['assignmentId', 'authorId', 'attemptNumber'], { unique: true })
export class CourseAssignmentSubmissionsEntity extends BaseEntity {
  @ApiProperty({ description: 'Assignment UUID' })
  @Column({ type: 'uuid' })
  assignmentId: string;

  @ApiPropertyOptional({ description: 'Text content or notes from student' })
  @Column({ type: 'text', nullable: true })
  content?: string;

  @ApiPropertyOptional({ description: 'Submitted files (JSON array)' })
  @Column({ type: 'simple-json', nullable: true })
  submissionFiles?: SubmissionFileInfo[];

  @ApiProperty({ description: 'Submission status', enum: SubmissionStatusEnum })
  @Column({
    type: 'enum',
    enum: SubmissionStatusEnum,
    default: SubmissionStatusEnum.Submitted,
  })
  status: SubmissionStatusEnum;

  @ApiPropertyOptional({ description: 'Score given by instructor' })
  @Column({ type: 'float', nullable: true })
  score?: number;

  @ApiPropertyOptional({ description: 'Feedback from instructor' })
  @Column({ type: 'text', nullable: true })
  feedback?: string;

  @ApiPropertyOptional({ description: 'When the submission was graded' })
  @Column({ type: 'timestamp', nullable: true })
  gradedAt?: Date;

  @ApiProperty({ description: 'Attempt number', example: 1 })
  @Column({ type: 'int', default: 1, unsigned: true })
  attemptNumber: number;

  @ApiProperty({ description: 'When the submission was submitted' })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  submittedAt: Date;

  // ===== RELATIONS =====

  @ManyToOne(() => CourseAssignmentsEntity, (a) => a.submissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assignmentId' })
  assignment: CourseAssignmentsEntity;
}
