import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsInt, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuizDto {
  @ApiProperty({ description: 'Quiz title', example: 'Kiểm tra: Mảng một chiều', maxLength: 255 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ description: 'Quiz description/instructions' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Time limit in minutes', example: 30 })
  @IsOptional()
  @IsInt()
  @Min(1)
  timeLimitMinutes?: number;

  @ApiPropertyOptional({ description: 'Passing score percentage (0-100)', example: 70 })
  @IsOptional()
  @IsInt()
  @Min(0)
  passingScore?: number;

  @ApiPropertyOptional({ description: 'Max attempts (0 = unlimited)', example: 3 })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxAttempts?: number;

  @ApiPropertyOptional({ description: 'Display order', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  quizOrder?: number;

  @ApiPropertyOptional({ description: 'Shuffle questions', example: false })
  @IsOptional()
  @IsBoolean()
  shuffleQuestions?: boolean;

  @ApiPropertyOptional({ description: 'Show correct answers after submission', example: true })
  @IsOptional()
  @IsBoolean()
  showCorrectAnswers?: boolean;

  @ApiPropertyOptional({ description: 'Whether published', example: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
