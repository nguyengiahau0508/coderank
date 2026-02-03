import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class GoogleLoginDto {
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    fullName: string;

    @IsNotEmpty()
    @IsString()
    providerId: string;

    @IsNotEmpty()
    @IsString()
    picture: string;

    @IsNotEmpty()
    @IsString()
    userAgent: string; // New property

    @IsNotEmpty()
    @IsString()
    ipAddress: string; // New property
}