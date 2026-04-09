import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsInt,
  Min,
  Max,
  MaxLength,
  IsEnum,
  IsDateString,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AssignmentTypeEnum } from '../../entities/course-assignments.entity';
import { Type } from 'class-transformer';

class AssignmentGradingCriterionDto {
  @ApiProperty({ description: 'Criterion name', example: 'Code quality' })
  @IsString()
  @IsNotEmpty()
  criterion: string;

  @ApiPropertyOptional({
    description: 'Criterion description',
    example: 'Readability, maintainability, and naming',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Maximum score for criterion', example: 30 })
  @IsNumber()
  @Min(0)
  maxScore: number;
}

export class CreateAssignmentDto {
  @ApiProperty({
    description: 'Assignment title',
    example: 'Bài tập 1: Xử lý mảng',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    description: 'Assignment description/instructions (HTML)',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Assignment type',
    enum: AssignmentTypeEnum,
  })
  @IsOptional()
  @IsEnum(AssignmentTypeEnum)
  type?: AssignmentTypeEnum;

  @ApiPropertyOptional({ description: 'Maximum score', example: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxScore?: number;

  @ApiPropertyOptional({ description: 'Due date (ISO string)' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Display order', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  assignmentOrder?: number;

  @ApiPropertyOptional({ description: 'Whether published' })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({
    description: 'Allowed file extensions (comma-separated)',
    example: '.pdf,.docx,.zip',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  allowedFileTypes?: string;

  @ApiPropertyOptional({ description: 'Maximum file size in MB', example: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  maxFileSizeMb?: number;

  @ApiPropertyOptional({
    description: 'Instructor-defined AI grading criteria',
    type: [AssignmentGradingCriterionDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssignmentGradingCriterionDto)
  gradingCriteria?: AssignmentGradingCriterionDto[];
}
