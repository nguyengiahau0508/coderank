import { BaseEntity } from "src/common/entities/base.entity";
import { GenderEnum, RoleEnum } from "src/common/enums/enums";
import { Column, Entity, OneToMany, Index, BeforeUpdate } from "typeorm";
import { TokenEntity } from "./token.entity";
import { AuthProviderEntity } from "./auth-provider.entity";
import { SessionEntity } from "./session.entity";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * User Entity
 * Represents a user in the CodeRank platform
 */
@Entity("users")
@Index(["createdAt"])
export class UserEntity extends BaseEntity {
    @ApiProperty({
        description: 'Unique username for the user',
        example: 'john_doe',
        maxLength: 50
    })
    @Column({ type: "varchar", length: 50, unique: true })
    username: string;

    @ApiProperty({
        description: 'Full name of the user',
        example: 'Nguyễn Văn A',
        maxLength: 255
    })
    @Column({ type: "varchar", length: 255 })
    fullName: string;

    @ApiProperty({
        description: 'Email address (unique, not exposed in responses)',
        example: 'user@example.com',
        maxLength: 255,
        writeOnly: true
    })
    @Column({ type: "varchar", length: 255, unique: true, select: false })
    email: string;

    @ApiPropertyOptional({
        description: 'URL to user avatar image',
        example: 'https://example.com/avatars/user123.jpg',
        nullable: true
    })
    @Column({ type: "longtext", nullable: true })
    avatarUrl: string;

    @ApiPropertyOptional({
        description: 'Phone number',
        example: '+84901234567',
        maxLength: 20,
        nullable: true
    })
    @Column({ type: "varchar", length: 20, nullable: true })
    phoneNumber: string;

    @ApiPropertyOptional({
        description: 'User address',
        example: '123 Nguyễn Du, Quận 1, TP.HCM',
        maxLength: 255,
        nullable: true
    })
    @Column({ type: "varchar", length: 255, nullable: true })
    address: string;

    @ApiPropertyOptional({
        description: 'Date of birth',
        type: 'string',
        format: 'date',
        example: '1995-06-15',
        nullable: true
    })
    @Column({ type: "date", nullable: true })
    birthday: Date;

    @ApiProperty({
        description: 'Gender of the user',
        enum: GenderEnum,
        enumName: 'GenderEnum',
        default: GenderEnum.Other,
        example: GenderEnum.Male
    })
    @Column({
        type: "enum",
        enum: GenderEnum,
        default: GenderEnum.Other
    })
    gender: GenderEnum;

    @ApiProperty({
        description: 'User roles (can have multiple)',
        type: [String],
        enum: RoleEnum,
        default: [RoleEnum.Student],
        example: ['student']
    })
    @Column({
        type: "simple-array",
        default: RoleEnum.Student
    })
    roles: RoleEnum[];

    @ApiProperty({
        description: 'User rating score (0-100)',
        type: 'number',
        minimum: 0,
        maximum: 100,
        default: 0,
        example: 75.50
    })
    @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
    rating: number;

    @ApiProperty({
        description: 'Whether the user account is active',
        type: 'boolean',
        default: true,
        example: true
    })
    @Column({ type: "boolean", default: true })
    isActive: boolean;

    @ApiProperty({
        description: 'Whether email has been verified',
        type: 'boolean',
        default: false,
        example: false
    })
    @Column({ type: "boolean", default: false })
    isEmailVerified: boolean;

    @ApiPropertyOptional({
        description: 'Last login timestamp',
        type: 'string',
        format: 'date-time',
        nullable: true,
        example: '2026-02-03T10:30:00Z'
    })
    @Column({ type: "timestamp", nullable: true })
    lastLoginAt: Date;

    @ApiProperty({
        description: 'Failed login attempts count',
        type: 'integer',
        minimum: 0,
        default: 0,
        example: 0
    })
    @Column({ type: "int", default: 0 })
    loginAttempts: number;

    @ApiPropertyOptional({
        description: 'Account locked until this timestamp',
        type: 'string',
        format: 'date-time',
        nullable: true,
        example: null
    })
    @Column({ type: "timestamp", nullable: true })
    lockedUntil: Date;

    @ApiPropertyOptional({
        description: 'User tokens',
        type: () => [TokenEntity]
    })
    @OneToMany(() => TokenEntity, (token) => token.user)
    tokens: TokenEntity[];

    @ApiPropertyOptional({
        description: 'Authentication providers linked to this user',
        type: () => [AuthProviderEntity]
    })
    @OneToMany(()=>AuthProviderEntity, (authProvider)=>authProvider.user)
    authProviders: AuthProviderEntity[];

    @ApiPropertyOptional({
        description: 'User sessions',
        type: () => [SessionEntity]
    })
    @OneToMany(() => SessionEntity, (session) => session.user)
    sessions: SessionEntity[];
}