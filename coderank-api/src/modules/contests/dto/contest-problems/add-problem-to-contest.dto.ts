import { IsString, IsInt, IsOptional, Min, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddProblemToContestDto {
  @ApiProperty({ description: 'Problem UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  problemId: string;

  @ApiPropertyOptional({ description: 'Problem order in contest', example: 0, minimum: 0, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  problemOrder?: number;

  @ApiPropertyOptional({ description: 'Points for this problem', example: 100, minimum: 1, default: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  points?: number;

  @ApiPropertyOptional({ description: 'Problem label (A, B, C, etc.)', example: 'A', maxLength: 10 })
  @IsOptional()
  @IsString()
  label?: string;
}
