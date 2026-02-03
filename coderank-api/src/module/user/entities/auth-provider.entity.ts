import { BaseEntity } from "src/common/entities/base.entity";
import { Column, Entity, JoinColumn, ManyToOne, Index } from "typeorm";
import { UserEntity } from "./user.entity";
import { AuthProvidersEnum } from "src/common/enums/enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * Auth Provider Entity
 * Stores OAuth provider information for each user
 */
@Entity("auth_providers")
@Index(["userId", "provider"], { unique: true })
@Index(["provider", "providerId"], { unique: true })
@Index(["provider"])
export class AuthProviderEntity extends BaseEntity {
  @ApiProperty({
    description: 'User ID associated with this auth provider',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid'
  })
  @Column({ type: "uuid" })
  userId: string;

  @ApiProperty({
    description: 'OAuth provider type',
    enum: AuthProvidersEnum,
    enumName: 'AuthProvidersEnum',
    example: AuthProvidersEnum.Google
  })
  @Column({
    type: "enum",
    enum: AuthProvidersEnum
  })
  provider: AuthProvidersEnum;

  @ApiProperty({
    description: 'Unique identifier from the OAuth provider',
    example: '123456789012345678901',
    maxLength: 255
  })
  @Column({ type: "varchar", length: 255 })
  providerId: string;

  @ApiPropertyOptional({
    description: 'Hashed password (for local auth, not exposed)',
    writeOnly: true,
    nullable: true
  })
  @Column({ type: "longtext", nullable: true, select: false })
  passwordHash: string;

  @ApiPropertyOptional({
    description: 'Email from OAuth provider',
    example: 'user@gmail.com',
    maxLength: 255,
    nullable: true
  })
  @Column({ type: "varchar", length: 255, nullable: true })
  providerEmail: string;

  @ApiPropertyOptional({
    description: 'Display name from OAuth provider',
    example: 'John Doe',
    maxLength: 255,
    nullable: true
  })
  @Column({ type: "varchar", length: 255, nullable: true })
  providerName: string;

  @ApiPropertyOptional({
    description: 'Avatar URL from OAuth provider',
    example: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
    nullable: true
  })
  @Column({ type: "longtext", nullable: true })
  providerAvatar: string;

  @ApiPropertyOptional({
    description: 'OAuth access token (not exposed)',
    writeOnly: true,
    nullable: true
  })
  @Column({ type: "longtext", nullable: true, select: false })
  accessToken: string;

  @ApiPropertyOptional({
    description: 'OAuth refresh token (not exposed)',
    writeOnly: true,
    nullable: true
  })
  @Column({ type: "longtext", nullable: true, select: false })
  refreshToken: string;

  @ApiPropertyOptional({
    description: 'Last time this provider was used for authentication',
    type: 'string',
    format: 'date-time',
    nullable: true,
    example: '2026-02-03T10:30:00Z'
  })
  @Column({ type: "timestamp", nullable: true })
  lastUsedAt: Date;

  @ApiPropertyOptional({
    description: 'Associated user',
    type: () => UserEntity
  })
  @ManyToOne(() => UserEntity, (user) => user.authProviders, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: UserEntity;
}