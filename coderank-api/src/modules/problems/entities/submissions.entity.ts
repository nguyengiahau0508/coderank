import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { UsersEntity } from 'src/modules/users/entities/user.entity';
import { ProblemsEntity } from './problems.entity';
import {
  ProgrammingLanguageEnum,
  SubmissionStatusEnum,
} from 'src/common/enums/enums';

@Entity('submissions')
@Index('IDX_submission_user', ['userId'])
@Index('IDX_submission_problem', ['problemId'])
@Index('IDX_submission_status', ['status'])
@Index('IDX_submission_user_problem', ['userId', 'problemId'])
export class SubmissionsEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  problemId: string;

  @Column({ type: 'text' })
  code: string;

  @Column({
    type: 'enum',
    enum: ProgrammingLanguageEnum,
    default: ProgrammingLanguageEnum.JavaScript,
  })
  language: ProgrammingLanguageEnum;

  @Column({
    type: 'enum',
    enum: SubmissionStatusEnum,
    default: SubmissionStatusEnum.Pending,
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

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ type: 'text', nullable: true })
  output?: string;

  @ManyToOne(() => UsersEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;

  @ManyToOne(() => ProblemsEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'problemId' })
  problem: ProblemsEntity;
}
