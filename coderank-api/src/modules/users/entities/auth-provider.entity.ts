import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, Index } from 'typeorm';
import { UsersEntity } from './user.entity';
import { AuthProvidersEnum } from 'src/common/enums/enums';
import {
  ApiUserIdProperty,
  ApiEnumProperty,
  ApiStringProperty,
  ApiWriteOnly,
  ApiStringOptional,
  ApiUrlOptional,
  ApiTimestampOptional,
  ApiRelationOptional,
} from 'src/common/decorators';

/**
 * Auth Provider Entity
 * Stores OAuth provider information for each user
 */
@Entity('auth_providers')
@Index(['userId', 'provider'], { unique: true })
@Index(['provider', 'providerId'], { unique: true })
@Index(['provider'])
export class AuthProvidersEntity extends BaseEntity {
  @ApiUserIdProperty()
  @Column({ type: 'uuid' })
  userId: string;

  @ApiEnumProperty(
    'OAuth provider type',
    AuthProvidersEnum,
    'AuthProvidersEnum',
    undefined,
    AuthProvidersEnum.Google,
  )
  @Column({
    type: 'enum',
    enum: AuthProvidersEnum,
  })
  provider: AuthProvidersEnum;

  @ApiStringProperty(
    'Unique identifier from the OAuth provider',
    '123456789012345678901',
    255,
  )
  @Column({ type: 'varchar', length: 255 })
  providerId: string;

  @ApiWriteOnly('Hashed password (for local auth)')
  @Column({ type: 'longtext', nullable: true, select: false })
  passwordHash: string;

  @ApiStringOptional('Email from OAuth provider', 'user@gmail.com', 255)
  @Column({ type: 'varchar', length: 255, nullable: true })
  providerEmail: string;

  @ApiStringOptional('Display name from OAuth provider', 'John Doe', 255)
  @Column({ type: 'varchar', length: 255, nullable: true })
  providerName: string;

  @ApiUrlOptional(
    'Avatar URL from OAuth provider',
    'https://lh3.googleusercontent.com/a/default-user=s96-c',
  )
  @Column({ type: 'longtext', nullable: true })
  providerAvatar: string;

  @ApiWriteOnly('OAuth access token')
  @Column({ type: 'longtext', nullable: true, select: false })
  accessToken: string;

  @ApiWriteOnly('OAuth refresh token')
  @Column({ type: 'longtext', nullable: true, select: false })
  refreshToken: string;

  @ApiTimestampOptional('Last time this provider was used for authentication')
  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt: Date;

  @ApiRelationOptional('Associated user', () => UsersEntity)
  @ManyToOne(() => UsersEntity, (user) => user.authProviders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;
}
