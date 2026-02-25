import { IsOptional, IsString, IsEnum, IsInt, Min, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { QuizQuestionTypeEnum } from 'src/common/enums/enums';

export class UpdateQuizQuestionDto {
  @ApiPropertyOptional({ description: 'Question text (Markdown)' })
  @IsOptional()
  @IsString()
  questionText?: string;

  @ApiPropertyOptional({ description: 'Question type', enum: QuizQuestionTypeEnum })
  @IsOptional()
  @IsEnum(QuizQuestionTypeEnum)
  questionType?: QuizQuestionTypeEnum;

  @ApiPropertyOptional({ description: 'Answer options (JSON array)' })
  @IsOptional()
  @IsArray()
  options?: Record<string, any>[];

  @ApiPropertyOptional({ description: 'Correct answer' })
  @IsOptional()
  @IsString()
  correctAnswer?: string;

  @ApiPropertyOptional({ description: 'Explanation' })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiPropertyOptional({ description: 'Points' })
  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  @IsInt()
  @Min(0)
  questionOrder?: number;

  @ApiPropertyOptional({ description: 'Image URL' })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
