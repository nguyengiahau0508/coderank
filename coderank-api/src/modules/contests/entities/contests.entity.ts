import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, ManyToOne, JoinColumn, OneToMany } from
  'typeorm';
import { UsersEntity } from 'src/modules/users/entities/user.entity';
import { ContestStatusEnum } from 'src/common/enums/enums';
import { ContestProblemsEntity } from './contest-problems.entity';
import { ContestParticipantsEntity } from './contest-participants.entity';

@Entity('contests')
@Index('IDX_contest_slug', ['slug'], { unique: true })
@Index('IDX_contest_status_dates', ['status', 'startTime', 'endTime'])
@Index('IDX_contest_author', ['authorId'])
export class ContestsEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true, select: false })
  description?: string;

  @Column({ type: 'text', nullable: true, select: false })
  rules?: string;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column({ type: 'int', nullable: true })
  durationMinutes?: number; // Thời gian thi (phút)

  @Column({
    type: 'enum', enum: ContestStatusEnum, default:
      ContestStatusEnum.Draft
  })
  status: ContestStatusEnum; // Draft, Upcoming, Running, Ended

  @Column({ type: 'boolean', default: false })
  isPublic: boolean; // Public/Private contest

  @Column({ type: 'boolean', default: false })
  isRated: boolean; // Có tính rating không

  @Column({ type: 'int', default: 0, unsigned: true })
  maxParticipants?: number; // Giới hạn số người tham gia

  @Column({ type: 'varchar', length: 100, nullable: true })
  password?: string; // Password cho contest private

  @ManyToOne(() => UsersEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'authorId' })
  author?: UsersEntity;

  @OneToMany(() => ContestProblemsEntity, (cp) => cp.contest, {
    cascade:
      true
  })
  contestProblems: ContestProblemsEntity[];

  @OneToMany(() => ContestParticipantsEntity, (cp) => cp.contest, {
    cascade: true
  })
  participants: ContestParticipantsEntity[];
}
