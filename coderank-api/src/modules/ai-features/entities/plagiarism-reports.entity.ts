import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { SubmissionsEntity } from 'src/modules/problems/entities/submissions.entity';

/**
 * Match found in plagiarism check.
 */
interface PlagiarismMatch {
  submissionId: string;
  similarity: number;
  matchedLines: Array<{
    sourceLine: number;
    targetLine: number;
  }>;
}

/**
 * Entity storing plagiarism detection results.
 */
@Entity('plagiarism_reports')
@Index('IDX_plagiarism_submission', ['submissionId'])
@Index('IDX_plagiarism_similarity', ['maxSimilarity'])
export class PlagiarismReportsEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  submissionId: string;

  @Column({ type: 'float', default: 0 })
  maxSimilarity: number; // Highest similarity score found (0-1)

  @Column({ type: 'boolean', default: false })
  isFlagged: boolean; // True if similarity exceeds threshold

  @Column({ type: 'json', nullable: true })
  matches?: PlagiarismMatch[];

  @Column({ type: 'int', default: 0 })
  matchCount: number;

  @Column({ type: 'text', nullable: true })
  analysis?: string; // AI analysis of the matches

  @Column({ type: 'boolean', default: false })
  isReviewed: boolean; // Has an admin reviewed this report?

  @Column({ type: 'uuid', nullable: true })
  reviewedById?: string; // Admin who reviewed

  @Column({ type: 'text', nullable: true })
  reviewNotes?: string;

  @Column({ type: 'int', nullable: true })
  processingTimeMs?: number;

  @ManyToOne(() => SubmissionsEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'submissionId' })
  submission: SubmissionsEntity;
}
