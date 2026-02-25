import { IsNotEmpty, IsOptional, IsString, IsEnum, IsBoolean, IsInt, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LessonTypeEnum } from 'src/common/enums/enums';

export class CreateLessonDto {
  @ApiProperty({ description: 'Lesson title', example: 'Bài 1: Mảng một chiều', maxLength: 255 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ description: 'Lesson content (Markdown)' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'Lesson type', enum: LessonTypeEnum })
  @IsOptional()
  @IsEnum(LessonTypeEnum)
  type?: LessonTypeEnum;

  @ApiPropertyOptional({ description: 'Video URL' })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional({ description: 'Video duration in seconds' })
  @IsOptional()
  @IsInt()
  @Min(0)
  videoDurationSeconds?: number;

  @ApiPropertyOptional({ description: 'Display order', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  lessonOrder?: number;

  @ApiPropertyOptional({ description: 'Estimated time in minutes', example: 15 })
  @IsOptional()
  @IsInt()
  @Min(0)
  estimatedMinutes?: number;

  @ApiPropertyOptional({ description: 'Whether published', example: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ description: 'Free preview', example: false })
  @IsOptional()
  @IsBoolean()
  isFreePreview?: boolean;
}
