import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ContestsEntity } from './contests.entity';
import { ProblemsEntity } from
  'src/modules/problems/entities/problems.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('contest_problems')
@Index('IDX_contest_problems_composite', ['contestId', 'problemOrder'])
@Index('IDX_contest_problems_problem', ['problemId'])
export class ContestProblemsEntity extends BaseEntity {
  @ApiProperty({ description: 'Contest UUID' })
  @Column({ type: 'uuid' })
  contestId: string;

  @ApiProperty({ description: 'Problem UUID' })
  @Column({ type: 'uuid' })
  problemId: string;

  @ApiProperty({ description: 'Problem order in contest', example: 0 })
  @Column({ type: 'int', default: 0 })
  problemOrder: number; // Thứ tự bài trong contest (A, B, C...)

  @ApiProperty({ description: 'Points for this problem', example: 100 })
  @Column({ type: 'int', default: 100, unsigned: true })
  points: number; // Điểm của bài trong contest này

  @ApiPropertyOptional({ description: 'Problem label (A, B, C, etc.)', example: 'A' })
  @Column({ type: 'varchar', length: 10, nullable: true })
  label?: string; // Nhãn: A, B, C, D...

  @ApiPropertyOptional({ description: 'Contest', type: () => ContestsEntity })
  @ManyToOne(() => ContestsEntity, (c) => c.contestProblems, {
    onDelete:
      'CASCADE'
  })
  @JoinColumn({ name: 'contestId' })
  contest: ContestsEntity;

  @ApiPropertyOptional({ description: 'Problem', type: () => ProblemsEntity })
  @ManyToOne(() => ProblemsEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'problemId' })
  problem: ProblemsEntity;
}
