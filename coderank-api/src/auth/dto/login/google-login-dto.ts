import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import {
  ApiEmailProperty,
  ApiStringProperty,
  ApiUrlProperty,
} from 'src/common/decorators';

/**
 * DTO for Google OAuth login data
 * Contains user information received from Google OAuth callback
 */
export class GoogleLoginDto {
    @ApiEmailProperty()
    @IsEmail()
    email: string;

    @ApiStringProperty('Full name from Google profile', 'Nguyễn Văn A')
    @IsNotEmpty()
    @IsString()
    fullName: string;

    @ApiStringProperty('Unique identifier from Google', '123456789012345678901')
    @IsNotEmpty()
    @IsString()
    providerId: string;

    @ApiUrlProperty('Profile picture URL from Google', 'https://lh3.googleusercontent.com/a/default-user=s96-c')
    @IsNotEmpty()
    @IsString()
    picture: string;

    @ApiStringProperty('User agent of the client browser/device', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
    @IsNotEmpty()
    @IsString()
    userAgent: string;

    @ApiStringProperty('IP address of the client', '192.168.1.1')
    @IsNotEmpty()
    @IsString()
    ipAddress: string;
}