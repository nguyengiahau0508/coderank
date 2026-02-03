import { BaseEntity } from "src/common/entities/base.entity";
import { Column, Entity, JoinColumn, ManyToOne, Index } from "typeorm";
import { UserEntity } from "./user.entity";
import { AuthProvidersEnum } from "src/common/enums/enums";

@Entity("auth_providers")
@Index(["userId", "provider"], { unique: true })
@Index(["provider", "providerId"], { unique: true })
@Index(["provider"])
export class AuthProviderEntity extends BaseEntity {
  @Column({ type: "uuid" })
  userId: string;

  @Column({
    type: "enum",
    enum: AuthProvidersEnum
  })
  provider: AuthProvidersEnum;

  @Column({ type: "varchar", length: 255 })
  providerId: string;

  @Column({ type: "longtext", nullable: true, select: false })
  passwordHash: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  providerEmail: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  providerName: string;

  @Column({ type: "longtext", nullable: true })
  providerAvatar: string;

  @Column({ type: "longtext", nullable: true, select: false })
  accessToken: string;

  @Column({ type: "longtext", nullable: true, select: false })
  refreshToken: string;

  @Column({ type: "timestamp", nullable: true })
  lastUsedAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.authProviders, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: UserEntity;
}