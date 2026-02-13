
import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ContestsEntity } from './contests.entity';
import { UsersEntity } from 'src/modules/users/entities/user.entity';
import { ProblemsEntity } from
  'src/modules/problems/entities/problems.entity';
import { SubmissionStatusEnum, ProgrammingLanguageEnum } from
  'src/common/enums/enums';

@Entity('contest_submissions')
@Index('IDX_contest_sub_contest', ['contestId'])
@Index('IDX_contest_sub_user_problem', ['userId', 'problemId',
  'contestId'])
@Index('IDX_contest_sub_status', ['status'])
export class ContestSubmissionsEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  contestId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  problemId: string;

  @Column({ type: 'text', select: false })
  code: string;

  @Column({ type: 'enum', enum: ProgrammingLanguageEnum })
  language: ProgrammingLanguageEnum;

  @Column({
    type: 'enum', enum: SubmissionStatusEnum, default:
      SubmissionStatusEnum.Pending
  })
  status: SubmissionStatusEnum;

  @Column({ type: 'int', default: 0 })
  score: number;

  @Column({ type: 'int', nullable: true })
  executionTimeMs?: number;

  @Column({ type: 'int', nullable: true })
  memoryUsedMb?: number;

  @Column({ type: 'int', default: 0 })
  passedTestcases: number;

  @Column({ type: 'int', default: 0 })
  totalTestcases: number;

  @Column({ type: 'text', nullable: true, select: false })
  errorMessage?: string;

  @Column({ type: 'timestamp' })
  submittedAt: Date;

  @ManyToOne(() => ContestsEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contestId' })
  contest: ContestsEntity;

  @ManyToOne(() => UsersEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;

  @ManyToOne(() => ProblemsEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'problemId' })
  problem: ProblemsEntity;
}
