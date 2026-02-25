import { IsOptional, IsString, IsNotEmpty, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitQuizAttemptDto {
  @ApiProperty({ description: 'Student answers as JSON array' })
  @IsNotEmpty()
  @IsArray()
  answers: Record<string, any>[];
}
