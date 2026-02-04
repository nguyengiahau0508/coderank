import { BaseEntity } from "src/common/entities/base.entity";
import { Column, Entity, ManyToOne, JoinColumn, Index } from "typeorm";
import { UserEntity } from "./user.entity";
import { SessionStatusEnum } from "src/common/enums/enums";
import {
  ApiUserIdProperty,
  ApiRelationOptional,
  ApiWriteOnly,
  ApiStringOptional,
  ApiEnumProperty,
  ApiExpiresAtProperty,
  ApiTimestampOptional,
  ApiBooleanProperty,
} from "src/common/decorators";

/**
 * Session Entity
 * Tracks user login sessions for security and device management
 */
@Entity("sessions")
@Index(["userId", "createdAt"])
@Index(["sessionToken"])
@Index(["userId", "status"])
export class SessionEntity extends BaseEntity {
  @ApiUserIdProperty()
  @Column({ type: "uuid" })
  userId: string;

  @ApiRelationOptional('Associated user', () => UserEntity)
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: "userId" })
  user: UserEntity;

  @ApiWriteOnly('Session token (JWT or unique identifier)')
  @Column({ type: "text" })
  sessionToken: string;

  @ApiWriteOnly('Refresh token for session renewal')
  @Column({ nullable: true, type: "text" })
  refreshToken: string;

  @ApiStringOptional('Browser/Client user agent string', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', 255)
  @Column({ type: "varchar", length: 255, nullable: true })
  userAgent: string;

  @ApiStringOptional('Client IP address', '192.168.1.100', 45)
  @Column({ type: "varchar", length: 45, nullable: true })
  ipAddress: string;

  @ApiStringOptional('Device name or identifier', 'MacBook Pro', 255)
  @Column({ type: "varchar", length: 255, nullable: true })
  deviceName: string;

  @ApiEnumProperty('Current session status', SessionStatusEnum, 'SessionStatusEnum', SessionStatusEnum.Active, SessionStatusEnum.Active)
  @Column({ type: "enum", enum: SessionStatusEnum, default: SessionStatusEnum.Active })
  status: SessionStatusEnum;

  @ApiExpiresAtProperty('Session expiration timestamp')
  @Column({ type: "timestamp" })
  expiresAt: Date;

  @ApiTimestampOptional('Last activity timestamp')
  @Column({ type: "timestamp", nullable: true })
  lastActivityAt: Date;

  @ApiBooleanProperty('Whether "Remember me" was selected', false)
  @Column({ type: "boolean", default: false })
  isRemembered: boolean;

  @ApiStringOptional('Type of device (web, mobile, tablet, desktop)', 'web', 50)
  @Column({ type: "varchar", length: 50, nullable: true })
  deviceType: string;

  @ApiStringOptional('Browser name and version', 'Chrome 120', 100)
  @Column({ type: "varchar", length: 100, nullable: true })
  browser: string;

  @ApiStringOptional('Operating system name and version', 'Windows 11', 100)
  @Column({ type: "varchar", length: 100, nullable: true })
  os: string;
}
