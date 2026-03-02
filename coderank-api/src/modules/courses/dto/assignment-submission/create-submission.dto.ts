import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SubmissionStatusEnum } from '../../entities/course-assignment-submissions.entity';

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
