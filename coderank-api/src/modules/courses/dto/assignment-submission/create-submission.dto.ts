import {
  IsOptional,
  IsString,
  IsEnum,
  IsArray,
  IsBoolean,
  IsNumber,
  IsUUID,
  IsEnum as IsEnumValidator,
  Max,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SubmissionStatusEnum } from '../../entities/course-assignment-submissions.entity';
import { AiProviderEnum } from 'src/common/enums/enums';

export class CreateSubmissionDto {
  @ApiPropertyOptional({ description: 'Text content or notes' })
  @IsOptional()
  @IsString()
  content?: string;
}

export class UpdateSubmissionDto {
  @ApiPropertyOptional({ description: 'Text content or notes' })
  @IsOptional()
  @IsString()
  content?: string;
}

export class GradeSubmissionDto {
  @ApiPropertyOptional({ description: 'Score' })
  @IsOptional()
  score?: number;

  @ApiPropertyOptional({ description: 'Feedback' })
  @IsOptional()
  @IsString()
  feedback?: string;

  @ApiPropertyOptional({ description: 'Status', enum: SubmissionStatusEnum })
  @IsOptional()
  @IsEnum(SubmissionStatusEnum)
  status?: SubmissionStatusEnum;
}

export class TriggerAiGradeAssignmentSubmissionsDto {
  @ApiPropertyOptional({
    description:
      'Specific submission IDs to grade. If omitted, the latest submission per student will be graded.',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  submissionIds?: string[];

  @ApiPropertyOptional({
    description: 'Similarity threshold (0-1) to flag suspicious submissions',
    example: 0.85,
    default: 0.85,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  similarityThreshold?: number;

  @ApiPropertyOptional({
    description: 'Whether to regrade already graded submissions',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  forceRegrade?: boolean;

  @ApiPropertyOptional({
    description: 'Optional AI provider override for this grading run',
    enum: AiProviderEnum,
  })
  @IsOptional()
  @IsEnumValidator(AiProviderEnum)
  provider?: AiProviderEnum;

  @ApiPropertyOptional({
    description: 'Optional model override for the selected provider',
    example: 'gemini-2.5-flash',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  modelName?: string;
}
