import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ProblemsEntity } from 'src/modules/problems/entities/problems.entity';

/**
 * Entity for storing AI-generated testcases.
 */
@Entity('ai_generated_testcases')
@Index('IDX_ai_testcase_problem', ['problemId'])
export class AiGeneratedTestcasesEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  problemId: string;

  @Column({ type: 'text' })
  input: string;

  @Column({ type: 'text' })
  expectedOutput: string;

  // Testcase category
  @Column({ type: 'varchar', length: 50, default: 'normal' })
  category: 'normal' | 'edge' | 'corner' | 'performance' | 'random';

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  descriptionVi?: string;

  // Whether this testcase was approved and used
  @Column({ type: 'boolean', default: false })
  isApproved: boolean;

  @Column({ type: 'boolean', default: false })
  isPublic: boolean; // Visible to students

  // Quality indicators
  @Column({ type: 'float', nullable: true })
  coverageScore?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  generatedBy?: string;

  @ManyToOne(() => ProblemsEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'problemId' })
  problem: ProblemsEntity;
}
