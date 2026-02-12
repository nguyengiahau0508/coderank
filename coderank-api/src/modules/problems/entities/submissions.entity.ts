import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ProblemsEntity } from './problems.entity';
import {
  ProgrammingLanguageEnum,
  SubmissionStatusEnum,
} from 'src/common/enums/enums';
import { UsersEntity } from 'src/modules/users/entities/user.entity';

@Entity('submissions')
@Index('IDX_submission_author', ['authorId'])
@Index('IDX_submission_problem', ['problemId'])
@Index('IDX_submission_status', ['status'])
@Index('IDX_submission_author_problem', ['authorId', 'problemId'])
export class SubmissionsEntity extends BaseEntity {
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

  @ManyToOne(() => ProblemsEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'problemId' })
  problem: ProblemsEntity;

  @ManyToOne(() => UsersEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'authorId' })
  author?: UsersEntity;
}
