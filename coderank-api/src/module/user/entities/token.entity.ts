import { BaseEntity } from "src/common/entities/base.entity";
import { Column, Entity, JoinColumn, ManyToOne, Index } from "typeorm";
import { UserEntity } from "./user.entity";
import { TokenTypeEnum } from "src/common/enums/enums";

@Entity("tokens")
@Index(["userId", "type"])
@Index(["tokenHash"])
@Index(["expiresAt"])
export class TokenEntity extends BaseEntity {
  @Column({ type: "uuid" })
  userId: string;

  @Column({ type: "varchar", length: 500 })
  tokenHash: string;

  @Column({
    type: "enum",
    enum: TokenTypeEnum,
    default: TokenTypeEnum.ACCESS
  })
  type: TokenTypeEnum;

  @Column({ type: "boolean", default: false })
  isRevoked: boolean;

  @Column({ type: "timestamp" })
  expiresAt: Date;

  @Column({ type: "timestamp", nullable: true })
  revokedAt: Date;

  @Column({ type: "varchar", length: 255, nullable: true })
  revokeReason: string;

  @ManyToOne(() => UserEntity, (user) => user.tokens, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: UserEntity;
}