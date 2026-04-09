import { IsEnum, IsOptional, IsString, IsUUID, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AiHintLevelEnum, ProgrammingLanguageEnum } from 'src/common/enums/enums';

export class GenerateHintsDto {
  @ApiPropertyOptional({
    description: 'Maximum hint level to generate',
    enum: AiHintLevelEnum,
    default: AiHintLevelEnum.Algorithm,
  })
  @IsOptional()
  @IsEnum(AiHintLevelEnum)
  maxLevel?: AiHintLevelEnum = AiHintLevelEnum.Algorithm;

  @ApiPropertyOptional({
    description: 'Force regenerate even if hints exist',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  forceRegenerate?: boolean = false;
}

export class GetHintsQueryDto {
  @ApiPropertyOptional({
    description: 'Maximum hint level to return',
    enum: AiHintLevelEnum,
  })
  @IsOptional()
  @IsEnum(AiHintLevelEnum)
  maxLevel?: AiHintLevelEnum;

  @ApiPropertyOptional({
    description: 'Language for hint content (vi or en)',
    default: 'vi',
  })
  @IsOptional()
  @IsString()
  lang?: 'vi' | 'en' = 'vi';
}

export class RequestCodeReviewDto {
  @ApiPropertyOptional({
    description: 'Language for feedback (vi or en)',
    default: 'vi',
  })
  @IsOptional()
  @IsString()
  lang?: 'vi' | 'en' = 'vi';
}

export class AlgorithmSuggestionDto {
  @ApiProperty({ description: 'Problem ID' })
  @IsUUID()
  problemId: string;

  @ApiPropertyOptional({
    description: 'User code for context',
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    description: 'Programming language',
    enum: ProgrammingLanguageEnum,
  })
  @IsOptional()
  @IsEnum(ProgrammingLanguageEnum)
  language?: ProgrammingLanguageEnum;
}

export class DebugAssistDto {
  @ApiProperty({ description: 'The code to debug' })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Programming language',
    enum: ProgrammingLanguageEnum,
  })
  @IsEnum(ProgrammingLanguageEnum)
  language: ProgrammingLanguageEnum;

  @ApiPropertyOptional({ description: 'Error message if any' })
  @IsOptional()
  @IsString()
  errorMessage?: string;

  @ApiPropertyOptional({ description: 'Expected output' })
  @IsOptional()
  @IsString()
  expectedOutput?: string;

  @ApiPropertyOptional({ description: 'Actual output' })
  @IsOptional()
  @IsString()
  actualOutput?: string;
}

export class ExplainSolutionDto {
  @ApiPropertyOptional({
    description: 'Language for explanation (vi or en)',
    default: 'vi',
  })
  @IsOptional()
  @IsString()
  lang?: 'vi' | 'en' = 'vi';

  @ApiPropertyOptional({
    description: 'Detail level (brief or detailed)',
    default: 'detailed',
  })
  @IsOptional()
  @IsString()
  detail?: 'brief' | 'detailed' = 'detailed';
}

export class GenerateLearningPathDto {
  @ApiProperty({ description: 'The topic/skill to learn' })
  @IsString()
  goalTopic: string;

  @ApiPropertyOptional({
    description: 'Target proficiency level',
    default: 'intermediate',
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
  })
  @IsOptional()
  @IsString()
  targetLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert' = 'intermediate';
}
