import { BaseEntity } from "src/common/entities/base.entity";
import { GenderEnum, RolesEnum } from "src/common/enums/enums";
import { Column, Entity, OneToMany, Index, BeforeUpdate } from "typeorm";
import { TokenEntity } from "./token.entity";
import { AuthProviderEntity } from "./auth-provider.entity";
import { SessionEntity } from "./session.entity";
import {
  ApiStringProperty,
  ApiStringOptional,
  ApiEmailProperty,
  ApiUrlOptional,
  ApiDateOptional,
  ApiEnumProperty,
  ApiEnumArrayProperty,
  ApiDecimalProperty,
  ApiBooleanProperty,
  ApiTimestampOptional,
  ApiIntProperty,
  ApiRelationArrayOptional,
} from "src/common/decorators";

/**
 * User Entity
 * Represents a user in the CodeRank platform
 */
@Entity("users")
@Index(["createdAt"])
export class UserEntity extends BaseEntity {
    @ApiStringProperty('Unique username for the user', 'john_doe', 50)
    @Column({ type: "varchar", length: 50, unique: true })
    username: string;

    @ApiStringProperty('Full name of the user', 'Nguyễn Văn A', 255)
    @Column({ type: "varchar", length: 255 })
    fullName: string;

    @ApiEmailProperty(true)
    @Column({ type: "varchar", length: 255, unique: true, select: false })
    email: string;

    @ApiUrlOptional('URL to user avatar image', 'https://example.com/avatars/user123.jpg')
    @Column({ type: "longtext", nullable: true })
    avatarUrl: string;

    @ApiStringOptional('Phone number', '+84901234567', 20)
    @Column({ type: "varchar", length: 20, nullable: true })
    phoneNumber: string;

    @ApiStringOptional('User address', '123 Nguyễn Du, Quận 1, TP.HCM', 255)
    @Column({ type: "varchar", length: 255, nullable: true })
    address: string;

    @ApiDateOptional('Date of birth', '1995-06-15')
    @Column({ type: "date", nullable: true })
    birthday: Date;

    @ApiEnumProperty('Gender of the user', GenderEnum, 'GenderEnum', GenderEnum.Other, GenderEnum.Male)
    @Column({
        type: "enum",
        enum: GenderEnum,
        default: GenderEnum.Other
    })
    gender: GenderEnum;

    @ApiEnumArrayProperty('User roles (can have multiple)', RolesEnum, [RolesEnum.Student], [RolesEnum.Student])
    @Column({
        type: "simple-array",
        default: RolesEnum.Student
    })
    roles: RolesEnum[];

    @ApiDecimalProperty('User rating score (0-100)', 0, 100, 0)
    @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
    rating: number;

    @ApiBooleanProperty('Whether the user account is active', true)
    @Column({ type: "boolean", default: true })
    isActive: boolean;

    @ApiBooleanProperty('Whether email has been verified', false)
    @Column({ type: "boolean", default: false })
    isEmailVerified: boolean;

    @ApiTimestampOptional('Last login timestamp')
    @Column({ type: "timestamp", nullable: true })
    lastLoginAt: Date;

    @ApiIntProperty('Failed login attempts count', 0, 0)
    @Column({ type: "int", default: 0 })
    loginAttempts: number;

    @ApiTimestampOptional('Account locked until this timestamp')
    @Column({ type: "timestamp", nullable: true })
    lockedUntil: Date;

    @ApiRelationArrayOptional('User tokens', () => [TokenEntity])
    @OneToMany(() => TokenEntity, (token) => token.user)
    tokens: TokenEntity[];

    @ApiRelationArrayOptional('Authentication providers linked to this user', () => [AuthProviderEntity])
    @OneToMany(()=>AuthProviderEntity, (authProvider)=>authProvider.user)
    authProviders: AuthProviderEntity[];

    @ApiRelationArrayOptional('User sessions', () => [SessionEntity])
    @OneToMany(() => SessionEntity, (session) => session.user)
    sessions: SessionEntity[];
}