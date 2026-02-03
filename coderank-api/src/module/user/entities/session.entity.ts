import { BaseEntity } from "src/common/entities/base.entity";
import { Column, Entity, ManyToOne, JoinColumn, Index } from "typeorm";
import { UserEntity } from "./user.entity";
import { SessionStatusEnum } from "src/common/enums/enums";

@Entity("sessions")
@Index(["userId", "createdAt"])
@Index(["sessionToken"])
@Index(["userId", "status"])
export class SessionEntity extends BaseEntity {
  @Column({ type: "uuid" })
  userId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: "userId" })
  user: UserEntity;

  @Column({ type: "text" })
  sessionToken: string;

  @Column({ nullable: true, type: "text" })
  refreshToken: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  userAgent: string;

  @Column({ type: "varchar", length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  deviceName: string;

  @Column({ type: "enum", enum: SessionStatusEnum, default: SessionStatusEnum.Active })
  status: SessionStatusEnum;

  @Column({ type: "timestamp" })
  expiresAt: Date;

  @Column({ type: "timestamp", nullable: true })
  lastActivityAt: Date;

  @Column({ type: "boolean", default: false })
  isRemembered: boolean;

  @Column({ type: "varchar", length: 50, nullable: true })
  deviceType: string; // web, mobile, tablet, desktop

  @Column({ type: "varchar", length: 100, nullable: true })
  browser: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  os: string;
}
