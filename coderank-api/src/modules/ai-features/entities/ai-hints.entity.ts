import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ProblemsEntity } from 'src/modules/problems/entities/problems.entity';
import { AiHintLevelEnum } from 'src/common/enums/enums';

/**
 * Entity storing AI-generated hints for problems.
 * Hints are generated at different levels of specificity.
 */
@Entity('ai_hints')
@Index('IDX_ai_hint_problem', ['problemId'])
@Index('IDX_ai_hint_problem_level', ['problemId', 'level'])
export class AiHintsEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  problemId: string;

  @Column({
    type: 'enum',
    enum: AiHintLevelEnum,
    default: AiHintLevelEnum.Approach,
  })
  level: AiHintLevelEnum;

  @Column({ type: 'text' })
  contentVi: string;

  @Column({ type: 'text' })
  contentEn: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  generatedBy?: string; // AI provider that generated this hint

  @ManyToOne(() => ProblemsEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'problemId' })
  problem: ProblemsEntity;
}
