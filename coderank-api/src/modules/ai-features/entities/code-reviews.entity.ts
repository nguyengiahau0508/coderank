import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { SubmissionsEntity } from 'src/modules/problems/entities/submissions.entity';
import { CodeReviewStatusEnum } from 'src/common/enums/enums';

/**
 * Code review issue identified by AI.
 */
interface CodeReviewIssue {
  severity: 'error' | 'warning' | 'info';
  line?: number;
  message: string;
  rule: string;
  suggestion?: string;
}

/**
 * Entity storing AI-generated code reviews for submissions.
 */
@Entity('code_reviews')
@Index('IDX_code_review_submission', ['submissionId'])
@Index('IDX_code_review_status', ['status'])
export class CodeReviewsEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  submissionId: string;

  @Column({
    type: 'enum',
    enum: CodeReviewStatusEnum,
    default: CodeReviewStatusEnum.Pending,
  })
  status: CodeReviewStatusEnum;

  // Overall scores (0-100)
  @Column({ type: 'smallint', default: 0 })
  overallScore: number;

  @Column({ type: 'smallint', default: 0 })
  readabilityScore: number;

  @Column({ type: 'smallint', default: 0 })
  maintainabilityScore: number;

  @Column({ type: 'smallint', default: 0 })
  efficiencyScore: number;

  @Column({ type: 'smallint', default: 0 })
  bestPracticesScore: number;

  // Complexity analysis
  @Column({ type: 'varchar', length: 20, nullable: true })
  timeComplexity?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  spaceComplexity?: string;

  // Detailed feedback (stored as JSON)
  @Column({ type: 'json', nullable: true })
  issues?: CodeReviewIssue[];

  @Column({ type: 'json', nullable: true })
  suggestions?: string[];

  @Column({ type: 'text', nullable: true })
  summary?: string;

  @Column({ type: 'text', nullable: true })
  summaryVi?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  reviewedBy?: string; // AI provider that performed the review

  @Column({ type: 'int', nullable: true })
  processingTimeMs?: number;

  @ManyToOne(() => SubmissionsEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'submissionId' })
  submission: SubmissionsEntity;
}
