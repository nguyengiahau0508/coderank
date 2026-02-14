import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateContestProblemDto {
  @ApiPropertyOptional({ description: 'Problem order in contest', example: 0, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  problemOrder?: number;

  @ApiPropertyOptional({ description: 'Points for this problem', example: 100, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  points?: number;

  @ApiPropertyOptional({ description: 'Problem label (A, B, C, etc.)', example: 'A', maxLength: 10 })
  @IsOptional()
  @IsString()
  label?: string;
}
