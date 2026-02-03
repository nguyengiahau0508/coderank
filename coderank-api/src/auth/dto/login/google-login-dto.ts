import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for Google OAuth login data
 * Contains user information received from Google OAuth callback
 */
export class GoogleLoginDto {
    @ApiProperty({
        description: 'Email address from Google account',
        example: 'user@gmail.com',
        format: 'email'
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Full name from Google profile',
        example: 'Nguyễn Văn A'
    })
    @IsNotEmpty()
    @IsString()
    fullName: string;

    @ApiProperty({
        description: 'Unique identifier from Google',
        example: '123456789012345678901'
    })
    @IsNotEmpty()
    @IsString()
    providerId: string;

    @ApiProperty({
        description: 'Profile picture URL from Google',
        example: 'https://lh3.googleusercontent.com/a/default-user=s96-c'
    })
    @IsNotEmpty()
    @IsString()
    picture: string;

    @ApiProperty({
        description: 'User agent of the client browser/device',
        example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    })
    @IsNotEmpty()
    @IsString()
    userAgent: string;

    @ApiProperty({
        description: 'IP address of the client',
        example: '192.168.1.1'
    })
    @IsNotEmpty()
    @IsString()
    ipAddress: string;
}