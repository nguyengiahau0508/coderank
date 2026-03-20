import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class JoinContestDto {
  @ApiPropertyOptional({
    description: 'Password for private contests',
    example: 'secret123',
  })
  @IsOptional()
  @IsString()
  password?: string;
}
