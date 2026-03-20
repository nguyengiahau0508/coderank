import {
  IsNotEmpty,
  IsEnum,
  IsDate,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TokenTypeEnum } from 'src/common/enums/enums';
import * as jwtPayloadInterface from 'src/common/interfaces/jwt-payload.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a new token
 * Used for generating access, refresh, or verification tokens
 */
export class CreateTokenDto {
  @ApiProperty({
    description: 'User ID associated with the token',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Type of token being created',
    enum: TokenTypeEnum,
    example: TokenTypeEnum.ACCESS,
    enumName: 'TokenTypeEnum',
  })
  @IsNotEmpty()
  @IsEnum(TokenTypeEnum)
  type: TokenTypeEnum;

  @ApiProperty({
    description: 'Token expiration date and time',
    type: 'string',
    format: 'date-time',
    example: '2026-02-10T12:00:00Z',
  })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  expiresAt: Date;

  @ApiPropertyOptional({
    description: 'JWT payload data',
  })
  @IsOptional()
  payload: jwtPayloadInterface.IJwtPayload;
}
