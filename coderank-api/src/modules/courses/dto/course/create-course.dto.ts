import { IsNotEmpty, IsOptional, IsString, IsEnum, IsBoolean, IsInt, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourseLevelEnum } from 'src/common/enums/enums';

export class CreateCourseDto {
  @ApiProperty({ description: 'Course title', example: 'Cấu trúc dữ liệu và Giải thuật', maxLength: 255 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ description: 'URL-friendly slug', example: 'cau-truc-du-lieu-va-giai-thuat' })
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

  @ApiPropertyOptional({ description: 'Whether course is publicly accessible', example: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Password for private courses' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  password?: string;

  @ApiPropertyOptional({ description: 'Maximum students (0 = unlimited)', example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxStudents?: number;

  @ApiPropertyOptional({ description: 'Estimated duration in minutes', example: 600 })
  @IsOptional()
  @IsInt()
  @Min(0)
  estimatedDurationMinutes?: number;

  @ApiPropertyOptional({ description: 'Comma-separated tags', example: 'algorithm,data-structure' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  tags?: string;

  @ApiPropertyOptional({ description: 'Course category', example: 'Data Structures' })
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
