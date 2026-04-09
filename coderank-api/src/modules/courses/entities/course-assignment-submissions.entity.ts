import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { CourseAssignmentsEntity } from './course-assignments.entity';
import { UsersEntity } from 'src/modules/users/entities/user.entity';
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

export interface SubmissionSimilarityMatch {
  submissionId: string;
  authorId: string;
  similarity: number;
}

export interface AssignmentAiGradingResult {
  rubricUsed: {
    criterion: string;
    description?: string;
    maxScore: number;
  }[];
  criterionScores?: {
    criterion: string;
    maxScore: number;
    score: number;
    feedback?: string;
  }[];
  score: number;
  maxScore: number;
  percentageScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  confidence: number;
  evaluatedFileCount: number;
  generatedAt: string;
  graderProvider?: string;
  graderModel?: string;
  error?: string;
}

@Entity('course_assignment_submissions')
@Index('IDX_submission_assignment', ['assignmentId'])
@Index('IDX_submission_user', ['authorId'])
@Index('IDX_submission_unique', ['assignmentId', 'authorId', 'attemptNumber'], {
  unique: true,
})
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

  @ApiPropertyOptional({
    description: 'Structured AI grading result for this submission',
  })
  @Column({ type: 'json', nullable: true })
  aiGradingResult?: AssignmentAiGradingResult;

  @ApiPropertyOptional({
    description: 'Whether submission is flagged by similarity scan',
    default: false,
  })
  @Column({ type: 'boolean', default: false })
  isSimilarityFlagged: boolean;

  @ApiPropertyOptional({
    description:
      'Top similarity matches with other submissions in same assignment',
  })
  @Column({ type: 'json', nullable: true })
  similarityMatches?: SubmissionSimilarityMatch[];

  @ApiPropertyOptional({
    description: 'Highest similarity score (0-1)',
    example: 0.87,
  })
  @Column({ type: 'float', nullable: true })
  maxSimilarityScore?: number;

  @ApiProperty({ description: 'Attempt number', example: 1 })
  @Column({ type: 'int', default: 1, unsigned: true })
  attemptNumber: number;

  @ApiProperty({ description: 'When the submission was submitted' })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  submittedAt: Date;

  // ===== RELATIONS =====

  @ManyToOne(() => CourseAssignmentsEntity, (a) => a.submissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'assignmentId' })
  assignment: CourseAssignmentsEntity;

  @ManyToOne(() => UsersEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'authorId' })
  author?: UsersEntity;
}
