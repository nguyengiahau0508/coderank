import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ContestsEntity } from './contests.entity';
import { UsersEntity } from 'src/modules/users/entities/user.entity';
import { ProblemsEntity } from 'src/modules/problems/entities/problems.entity';
import {
  SubmissionStatusEnum,
  ProgrammingLanguageEnum,
} from 'src/common/enums/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('contest_submissions')
@Index('IDX_contest_sub_contest', ['contestId'])
@Index('IDX_contest_sub_user_problem', ['userId', 'problemId', 'contestId'])
@Index('IDX_contest_sub_status', ['status'])
export class ContestSubmissionsEntity extends BaseEntity {
  @ApiProperty({ description: 'Contest UUID' })
  @Column({ type: 'uuid' })
  contestId: string;

  @ApiProperty({ description: 'User UUID' })
  @Column({ type: 'uuid' })
  userId: string;

  @ApiProperty({ description: 'Problem UUID' })
  @Column({ type: 'uuid' })
  problemId: string;

  @ApiProperty({ description: 'Source code' })
  @Column({ type: 'text', select: false })
  code: string;

  @ApiProperty({
    description: 'Programming language',
    enum: ProgrammingLanguageEnum,
  })
  @Column({ type: 'enum', enum: ProgrammingLanguageEnum })
  language: ProgrammingLanguageEnum;

  @ApiProperty({ description: 'Submission status', enum: SubmissionStatusEnum })
  @Column({
    type: 'enum',
    enum: SubmissionStatusEnum,
    default: SubmissionStatusEnum.Pending,
  })
  status: SubmissionStatusEnum;

  @ApiProperty({ description: 'Score achieved', example: 0 })
  @Column({ type: 'int', default: 0 })
  score: number;

  @ApiPropertyOptional({
    description: 'Execution time in milliseconds',
    example: 100,
  })
  @Column({ type: 'int', nullable: true })
  executionTimeMs?: number;

  @ApiPropertyOptional({ description: 'Memory used in MB', example: 10 })
  @Column({ type: 'int', nullable: true })
  memoryUsedMb?: number;

  @ApiProperty({ description: 'Number of passed test cases', example: 0 })
  @Column({ type: 'int', default: 0 })
  passedTestcases: number;

  @ApiProperty({ description: 'Total number of test cases', example: 0 })
  @Column({ type: 'int', default: 0 })
  totalTestcases: number;

  @ApiPropertyOptional({ description: 'Error message if any' })
  @Column({ type: 'text', nullable: true, select: false })
  errorMessage?: string;

  @ApiProperty({ description: 'When submission was made' })
  @Column({ type: 'timestamp' })
  submittedAt: Date;

  @ApiPropertyOptional({ description: 'Contest', type: () => ContestsEntity })
  @ManyToOne(() => ContestsEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contestId' })
  contest: ContestsEntity;

  @ApiPropertyOptional({ description: 'User', type: () => UsersEntity })
  @ManyToOne(() => UsersEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;

  @ApiPropertyOptional({ description: 'Problem', type: () => ProblemsEntity })
  @ManyToOne(() => ProblemsEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'problemId' })
  problem: ProblemsEntity;
}
