import { BaseEntity } from "src/common/entities/base.entity";
import { Column, Entity, JoinColumn, ManyToOne, Index } from "typeorm";
import { UserEntity } from "./user.entity";
import { TokenTypeEnum } from "src/common/enums/enums";
import {
  ApiUserIdProperty,
  ApiWriteOnly,
  ApiEnumProperty,
  ApiBooleanProperty,
  ApiExpiresAtProperty,
  ApiTimestampOptional,
  ApiStringOptional,
  ApiRelationOptional,
} from "src/common/decorators";

/**
 * Token Entity
 * Stores various types of tokens (access, refresh, verification, etc.)
 */
@Entity("tokens")
@Index(["userId", "type"])
@Index(["tokenHash"])
@Index(["expiresAt"])
export class TokenEntity extends BaseEntity {
  @ApiUserIdProperty()
  @Column({ type: "uuid" })
  userId: string;

  @ApiWriteOnly('Hashed token value')
  @Column({ type: "varchar", length: 500 })
  tokenHash: string;

  @ApiEnumProperty('Type of token', TokenTypeEnum, 'TokenTypeEnum', TokenTypeEnum.ACCESS, TokenTypeEnum.ACCESS)
  @Column({
    type: "enum",
    enum: TokenTypeEnum,
    default: TokenTypeEnum.ACCESS
  })
  type: TokenTypeEnum;

  @ApiBooleanProperty('Whether the token has been revoked', false)
  @Column({ type: "boolean", default: false })
  isRevoked: boolean;

  @ApiExpiresAtProperty('Token expiration timestamp')
  @Column({ type: "timestamp" })
  expiresAt: Date;

  @ApiTimestampOptional('Timestamp when the token was revoked')
  @Column({ type: "timestamp", nullable: true })
  revokedAt: Date;

  @ApiStringOptional('Reason for token revocation', 'User logged out', 255)
  @Column({ type: "varchar", length: 255, nullable: true })
  revokeReason: string;

  @ApiRelationOptional('Associated user', () => UserEntity)
  @ManyToOne(() => UserEntity, (user) => user.tokens, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: UserEntity;
}