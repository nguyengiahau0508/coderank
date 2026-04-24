import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ContestsEntity } from './contests.entity';
import { UsersEntity } from 'src/modules/users/entities/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('contest_participants')
@Index('IDX_contest_participant_unique', ['contestId', 'userId'], {
  unique: true,
})
@Index('IDX_contest_participant_contest', ['contestId'])
@Index('IDX_contest_participant_user', ['userId'])
@Index('IDX_contest_participant_rank', ['contestId', 'rank'])
export class ContestParticipantsEntity extends BaseEntity {
  @ApiProperty({ description: 'Contest UUID' })
  @Column({ type: 'uuid' })
  contestId: string;

  @ApiProperty({ description: 'User UUID' })
  @Column({ type: 'uuid' })
  userId: string;

  @ApiPropertyOptional({ description: 'When user joined the contest' })
  @Column({ type: 'timestamp', nullable: true })
  joinedAt?: Date;

  @ApiProperty({ description: 'Total score', example: 0 })
  @Column({ type: 'int', default: 0 })
  totalScore: number;

  @ApiPropertyOptional({ description: 'Participant rank', example: 1 })
  @Column({ type: 'int', nullable: true })
  rank?: number;

  @ApiProperty({ description: 'Number of solved problems', example: 0 })
  @Column({ type: 'int', default: 0 })
  solvedProblems: number; // Số bài đã giải

  @ApiPropertyOptional({
    description: 'Snapshot of Elo before contest rating update',
    example: 1400,
  })
  @Column({ type: 'int', nullable: true })
  oldRating?: number;

  @ApiPropertyOptional({
    description: 'Expected performance indicator used by Elo formula',
    example: 2.3456,
  })
  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  expectedPerformanceIndicator?: number;

  @ApiPropertyOptional({
    description: 'Actual rank used by Elo formula',
    example: 3,
  })
  @Column({ type: 'int', nullable: true })
  actualRank?: number;

  @ApiPropertyOptional({
    description: 'Elo delta after contest rating update',
    example: 12.34,
  })
  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  ratingDelta?: number;

  @ApiPropertyOptional({
    description: 'Snapshot of Elo after contest rating update',
    example: 1412,
  })
  @Column({ type: 'int', nullable: true })
  newRating?: number;

  @ApiPropertyOptional({
    description: 'Penalty time in minutes (ACM format)',
    example: 0,
  })
  @Column({ type: 'int', nullable: true })
  penaltyMinutes?: number; // Penalty time (for ACM format)

  @ApiProperty({
    description: 'Whether submission is finalized',
    example: false,
  })
  @Column({ type: 'boolean', default: false })
  isFinalized: boolean; // Đã hoàn thành/nộp bài cuối

  @ApiPropertyOptional({ description: 'Contest', type: () => ContestsEntity })
  @ManyToOne(() => ContestsEntity, (c) => c.participants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'contestId' })
  contest: ContestsEntity;

  @ApiPropertyOptional({ description: 'User', type: () => UsersEntity })
  @ManyToOne(() => UsersEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;
}
