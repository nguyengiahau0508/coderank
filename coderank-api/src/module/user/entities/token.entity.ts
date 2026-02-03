import { BaseEntity } from "src/common/entities/base.entity";
import { Column, Entity, JoinColumn, ManyToOne, Index } from "typeorm";
import { UserEntity } from "./user.entity";
import { TokenTypeEnum } from "src/common/enums/enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * Token Entity
 * Stores various types of tokens (access, refresh, verification, etc.)
 */
@Entity("tokens")
@Index(["userId", "type"])
@Index(["tokenHash"])
@Index(["expiresAt"])
export class TokenEntity extends BaseEntity {
  @ApiProperty({
    description: 'User ID associated with this token',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid'
  })
  @Column({ type: "uuid" })
  userId: string;

  @ApiProperty({
    description: 'Hashed token value (not exposed)',
    writeOnly: true,
    maxLength: 500
  })
  @Column({ type: "varchar", length: 500 })
  tokenHash: string;

  @ApiProperty({
    description: 'Type of token',
    enum: TokenTypeEnum,
    enumName: 'TokenTypeEnum',
    default: TokenTypeEnum.ACCESS,
    example: TokenTypeEnum.ACCESS
  })
  @Column({
    type: "enum",
    enum: TokenTypeEnum,
    default: TokenTypeEnum.ACCESS
  })
  type: TokenTypeEnum;

  @ApiProperty({
    description: 'Whether the token has been revoked',
    type: 'boolean',
    default: false,
    example: false
  })
  @Column({ type: "boolean", default: false })
  isRevoked: boolean;

  @ApiProperty({
    description: 'Token expiration timestamp',
    type: 'string',
    format: 'date-time',
    example: '2026-02-10T10:30:00Z'
  })
  @Column({ type: "timestamp" })
  expiresAt: Date;

  @ApiPropertyOptional({
    description: 'Timestamp when the token was revoked',
    type: 'string',
    format: 'date-time',
    nullable: true,
    example: null
  })
  @Column({ type: "timestamp", nullable: true })
  revokedAt: Date;

  @ApiPropertyOptional({
    description: 'Reason for token revocation',
    example: 'User logged out',
    maxLength: 255,
    nullable: true
  })
  @Column({ type: "varchar", length: 255, nullable: true })
  revokeReason: string;

  @ApiPropertyOptional({
    description: 'Associated user',
    type: () => UserEntity
  })
  @ManyToOne(() => UserEntity, (user) => user.tokens, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: UserEntity;
}