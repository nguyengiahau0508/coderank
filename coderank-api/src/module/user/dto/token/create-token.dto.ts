
import { IsNotEmpty, IsEnum, IsDate, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { TokenTypeEnum } from 'src/common/enums/enums';

export class CreateTokenDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsEnum(TokenTypeEnum)
  type: TokenTypeEnum;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  expiresAt: Date;

  @IsOptional()
  @IsString()
  revokeReason?: string;
}