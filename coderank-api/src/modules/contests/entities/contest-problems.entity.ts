import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ContestsEntity } from './contests.entity';
import { ProblemsEntity } from
  'src/modules/problems/entities/problems.entity';

@Entity('contest_problems')
@Index('IDX_contest_problems_composite', ['contestId', 'problemOrder'])
@Index('IDX_contest_problems_problem', ['problemId'])
export class ContestProblemsEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  contestId: string;

  @Column({ type: 'uuid' })
  problemId: string;

  @Column({ type: 'int', default: 0 })
  problemOrder: number; // Thứ tự bài trong contest (A, B, C...)

  @Column({ type: 'int', default: 100, unsigned: true })
  points: number; // Điểm của bài trong contest này

  @Column({ type: 'varchar', length: 10, nullable: true })
  label?: string; // Nhãn: A, B, C, D...

  @ManyToOne(() => ContestsEntity, (c) => c.contestProblems, {
    onDelete:
      'CASCADE'
  })
  @JoinColumn({ name: 'contestId' })
  contest: ContestsEntity;

  @ManyToOne(() => ProblemsEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'problemId' })
  problem: ProblemsEntity;
}
