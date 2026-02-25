import { IsOptional, IsString, IsEnum, IsBoolean, IsInt, Min, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CourseLevelEnum, CourseStatusEnum } from 'src/common/enums/enums';

export class UpdateCourseDto {
  @ApiPropertyOptional({ description: 'Course title', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ description: 'URL-friendly slug' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @ApiPropertyOptional({ description: 'Short summary' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  summary?: string;

  @ApiPropertyOptional({ description: 'Full description (Markdown)' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Thumbnail image URL' })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: 'Course level', enum: CourseLevelEnum })
  @IsOptional()
  @IsEnum(CourseLevelEnum)
  level?: CourseLevelEnum;

  @ApiPropertyOptional({ description: 'Course status', enum: CourseStatusEnum })
  @IsOptional()
  @IsEnum(CourseStatusEnum)
  status?: CourseStatusEnum;

  @ApiPropertyOptional({ description: 'Whether course is publicly accessible' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Password for private courses' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  password?: string;

  @ApiPropertyOptional({ description: 'Maximum students (0 = unlimited)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxStudents?: number;

  @ApiPropertyOptional({ description: 'Estimated duration in minutes' })
  @IsOptional()
  @IsInt()
  @Min(0)
  estimatedDurationMinutes?: number;

  @ApiPropertyOptional({ description: 'Comma-separated tags' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  tags?: string;

  @ApiPropertyOptional({ description: 'Course category' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({ description: 'Learning objectives (JSON array string)' })
  @IsOptional()
  @IsString()
  learningObjectives?: string;

  @ApiPropertyOptional({ description: 'Prerequisites (JSON array string)' })
  @IsOptional()
  @IsString()
  prerequisites?: string;
}
