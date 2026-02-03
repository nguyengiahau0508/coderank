import { BaseEntity } from "src/common/entities/base.entity";
import { Column, Entity, ManyToOne, JoinColumn, Index } from "typeorm";
import { UserEntity } from "./user.entity";
import { SessionStatusEnum } from "src/common/enums/enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * Session Entity
 * Tracks user login sessions for security and device management
 */
@Entity("sessions")
@Index(["userId", "createdAt"])
@Index(["sessionToken"])
@Index(["userId", "status"])
export class SessionEntity extends BaseEntity {
  @ApiProperty({
    description: 'User ID associated with this session',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid'
  })
  @Column({ type: "uuid" })
  userId: string;

  @ApiPropertyOptional({
    description: 'Associated user',
    type: () => UserEntity
  })
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: "userId" })
  user: UserEntity;

  @ApiProperty({
    description: 'Session token (JWT or unique identifier)',
    writeOnly: true
  })
  @Column({ type: "text" })
  sessionToken: string;

  @ApiPropertyOptional({
    description: 'Refresh token for session renewal',
    writeOnly: true,
    nullable: true
  })
  @Column({ nullable: true, type: "text" })
  refreshToken: string;

  @ApiPropertyOptional({
    description: 'Browser/Client user agent string',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    maxLength: 255,
    nullable: true
  })
  @Column({ type: "varchar", length: 255, nullable: true })
  userAgent: string;

  @ApiPropertyOptional({
    description: 'Client IP address',
    example: '192.168.1.100',
    maxLength: 45,
    nullable: true
  })
  @Column({ type: "varchar", length: 45, nullable: true })
  ipAddress: string;

  @ApiPropertyOptional({
    description: 'Device name or identifier',
    example: 'MacBook Pro',
    maxLength: 255,
    nullable: true
  })
  @Column({ type: "varchar", length: 255, nullable: true })
  deviceName: string;

  @ApiProperty({
    description: 'Current session status',
    enum: SessionStatusEnum,
    enumName: 'SessionStatusEnum',
    default: SessionStatusEnum.Active,
    example: SessionStatusEnum.Active
  })
  @Column({ type: "enum", enum: SessionStatusEnum, default: SessionStatusEnum.Active })
  status: SessionStatusEnum;

  @ApiProperty({
    description: 'Session expiration timestamp',
    type: 'string',
    format: 'date-time',
    example: '2026-02-10T10:30:00Z'
  })
  @Column({ type: "timestamp" })
  expiresAt: Date;

  @ApiPropertyOptional({
    description: 'Last activity timestamp',
    type: 'string',
    format: 'date-time',
    nullable: true,
    example: '2026-02-03T10:30:00Z'
  })
  @Column({ type: "timestamp", nullable: true })
  lastActivityAt: Date;

  @ApiProperty({
    description: 'Whether "Remember me" was selected',
    type: 'boolean',
    default: false,
    example: false
  })
  @Column({ type: "boolean", default: false })
  isRemembered: boolean;

  @ApiPropertyOptional({
    description: 'Type of device (web, mobile, tablet, desktop)',
    example: 'web',
    maxLength: 50,
    nullable: true
  })
  @Column({ type: "varchar", length: 50, nullable: true })
  deviceType: string;

  @ApiPropertyOptional({
    description: 'Browser name and version',
    example: 'Chrome 120',
    maxLength: 100,
    nullable: true
  })
  @Column({ type: "varchar", length: 100, nullable: true })
  browser: string;

  @ApiPropertyOptional({
    description: 'Operating system name and version',
    example: 'Windows 11',
    maxLength: 100,
    nullable: true
  })
  @Column({ type: "varchar", length: 100, nullable: true })
  os: string;
}
