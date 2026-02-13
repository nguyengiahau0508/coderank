
import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ContestsEntity } from './contests.entity';
import { UsersEntity } from 'src/modules/users/entities/user.entity';

@Entity('contest_participants')
@Index('IDX_contest_participant_unique', ['contestId', 'userId'], {
  unique:
    true
})
@Index('IDX_contest_participant_contest', ['contestId'])
@Index('IDX_contest_participant_user', ['userId'])
@Index('IDX_contest_participant_rank', ['contestId', 'rank'])
export class ContestParticipantsEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  contestId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'timestamp', nullable: true })
  joinedAt?: Date;

  @Column({ type: 'int', default: 0 })
  totalScore: number;

  @Column({ type: 'int', nullable: true })
  rank?: number;

  @Column({ type: 'int', default: 0 })
  solvedProblems: number; // Số bài đã giải

  @Column({ type: 'int', nullable: true })
  penaltyMinutes?: number; // Penalty time (for ACM format)

  @Column({ type: 'boolean', default: false })
  isFinalized: boolean; // Đã hoàn thành/nộp bài cuối

  @ManyToOne(() => ContestsEntity, (c) => c.participants, {
    onDelete:
      'CASCADE'
  })
  @JoinColumn({ name: 'contestId' })
  contest: ContestsEntity;

  @ManyToOne(() => UsersEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;
}

