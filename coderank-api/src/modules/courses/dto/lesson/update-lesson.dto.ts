import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { LessonTypeEnum } from 'src/common/enums/enums';

export class UpdateLessonDto {
  @ApiPropertyOptional({ description: 'Lesson title', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

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

  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  @IsInt()
  @Min(0)
  lessonOrder?: number;

  @ApiPropertyOptional({ description: 'Estimated time in minutes' })
  @IsOptional()
  @IsInt()
  @Min(0)
  estimatedMinutes?: number;

  @ApiPropertyOptional({ description: 'Whether published' })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ description: 'Free preview' })
  @IsOptional()
  @IsBoolean()
  isFreePreview?: boolean;
}
