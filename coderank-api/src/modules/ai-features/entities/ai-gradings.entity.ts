import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { UsersEntity } from 'src/modules/users/entities/user.entity';
import { SubmissionsEntity } from 'src/modules/problems/entities/submissions.entity';

/**
 * Entity for storing AI rubric-based gradings for open-ended assignments.
 */
@Entity('ai_gradings')
@Index('IDX_ai_grading_submission', ['submissionId'])
@Index('IDX_ai_grading_grader', ['gradedBy'])
export class AiGradingsEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  submissionId: string;

  // Rubric-based scores
  @Column({ type: 'json' })
  rubricScores: {
    criterion: string;
    criterionVi?: string;
    maxScore: number;
    score: number;
    feedback: string;
    feedbackVi?: string;
  }[];

  // Overall scores
  @Column({ type: 'float' })
  totalScore: number;

  @Column({ type: 'float' })
  maxPossibleScore: number;

  @Column({ type: 'float' })
  percentageScore: number;

  // Detailed feedback
  @Column({ type: 'text', nullable: true })
  overallFeedback?: string;

  @Column({ type: 'text', nullable: true })
  overallFeedbackVi?: string;

  // Strengths and areas for improvement
  @Column({ type: 'json', nullable: true })
  strengths?: string[];

  @Column({ type: 'json', nullable: true })
  strengthsVi?: string[];

  @Column({ type: 'json', nullable: true })
  improvements?: string[];

  @Column({ type: 'json', nullable: true })
  improvementsVi?: string[];

  // Confidence score (0-1)
  @Column({ type: 'float', default: 0.8 })
  confidenceScore: number;

  // Grading metadata
  @Column({ type: 'varchar', length: 50, nullable: true })
  aiProvider?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  aiModel?: string;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean; // Instructor has verified this grading

  @Column({ type: 'uuid', nullable: true })
  verifiedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt?: Date;

  // Override fields (if instructor modified)
  @Column({ type: 'float', nullable: true })
  overrideScore?: number;

  @Column({ type: 'text', nullable: true })
  overrideFeedback?: string;

  @Column({ type: 'uuid', nullable: true })
  gradedBy?: string; // Instructor who requested grading

  @ManyToOne(() => SubmissionsEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'submissionId' })
  submission: SubmissionsEntity;

  @ManyToOne(() => UsersEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'gradedBy' })
  grader?: UsersEntity;

  @ManyToOne(() => UsersEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'verifiedBy' })
  verifier?: UsersEntity;
}
