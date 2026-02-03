
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GoogleLoginDto {
    @IsNotEmpty()
    @IsString()
    providerId: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    fullName: string;

    @IsOptional()
    @IsString()
    picture?: string;
}