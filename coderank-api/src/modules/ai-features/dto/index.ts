import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNumber,
  Min,
  Max,
  IsArray,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AiHintLevelEnum,
  AiProviderEnum,
  ProgrammingLanguageEnum,
} from 'src/common/enums/enums';

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

  @ApiPropertyOptional({
    description: 'Language for response (vi or en)',
    default: 'vi',
  })
  @IsOptional()
  @IsString()
  lang?: 'vi' | 'en' = 'vi';

  @ApiPropertyOptional({
    description: 'AI provider preference for this request',
    enum: AiProviderEnum,
  })
  @IsOptional()
  @IsEnum(AiProviderEnum)
  provider?: AiProviderEnum;
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

  @ApiPropertyOptional({
    description: 'AI provider preference for this request',
    enum: AiProviderEnum,
  })
  @IsOptional()
  @IsEnum(AiProviderEnum)
  provider?: AiProviderEnum;
}

export class TranslateCodeDto {
  @ApiProperty({ description: 'Source code' })
  @IsString()
  sourceCode: string;

  @ApiProperty({
    description: 'Source language',
    enum: ProgrammingLanguageEnum,
  })
  @IsEnum(ProgrammingLanguageEnum)
  sourceLanguage: ProgrammingLanguageEnum;

  @ApiProperty({
    description: 'Target language',
    enum: ProgrammingLanguageEnum,
  })
  @IsEnum(ProgrammingLanguageEnum)
  targetLanguage: ProgrammingLanguageEnum;

  @ApiPropertyOptional({
    description: 'AI provider preference for this request',
    enum: AiProviderEnum,
  })
  @IsOptional()
  @IsEnum(AiProviderEnum)
  provider?: AiProviderEnum;
}

export class GenerateProblemDraftDto {
  @ApiProperty({ description: 'Problem topic' })
  @IsString()
  topic: string;

  @ApiProperty({
    description: 'Difficulty level',
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  })
  @IsIn(['easy', 'medium', 'hard'])
  difficulty: 'easy' | 'medium' | 'hard' = 'medium';

  @ApiPropertyOptional({ description: 'Optional constraints' })
  @IsOptional()
  @IsString()
  constraints?: string;

  @ApiPropertyOptional({
    description: 'Language for generated draft',
    enum: ['vi', 'en'],
    default: 'vi',
  })
  @IsOptional()
  @IsString()
  lang?: 'vi' | 'en' = 'vi';

  @ApiPropertyOptional({
    description: 'AI provider preference for this request',
    enum: AiProviderEnum,
  })
  @IsOptional()
  @IsEnum(AiProviderEnum)
  provider?: AiProviderEnum;
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
  targetLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert' =
    'intermediate';
}

export class GenerateTestcasesDto {
  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  includeEdgeCases?: boolean = true;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  includeCornerCases?: boolean = true;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  includePerformance?: boolean = true;

  @ApiPropertyOptional({ default: 5, minimum: 1, maximum: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  count?: number = 5;
}

export class GenerateAnalyticsDto {
  @ApiProperty({ description: 'ISO start datetime' })
  @IsDateString()
  periodStart: string;

  @ApiProperty({ description: 'ISO end datetime' })
  @IsDateString()
  periodEnd: string;
}

export class GradeSubmissionDto {
  @ApiPropertyOptional({
    description: 'Optional custom rubric',
    type: 'array',
  })
  @IsOptional()
  @IsArray()
  rubric?: Array<{
    criterion: string;
    criterionVi?: string;
    maxScore: number;
    description?: string;
  }>;
}

export class VerifyGradingDto {
  @ApiPropertyOptional({ description: 'Override score', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  overrideScore?: number;

  @ApiPropertyOptional({ description: 'Override feedback' })
  @IsOptional()
  @IsString()
  overrideFeedback?: string;
}

export class ExplainSubmissionErrorDto {
  @ApiPropertyOptional({
    description: 'Response language',
    default: 'vi',
    enum: ['vi', 'en'],
  })
  @IsOptional()
  @IsString()
  lang?: 'vi' | 'en' = 'vi';

  @ApiPropertyOptional({
    description: 'Force regenerate explanation',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  forceRegenerate?: boolean = false;

  @ApiPropertyOptional({
    description: 'AI provider preference for this request',
    enum: AiProviderEnum,
  })
  @IsOptional()
  @IsEnum(AiProviderEnum)
  provider?: AiProviderEnum;
}

export class PlagiarismCheckDto {
  @ApiPropertyOptional({
    description: 'Similarity threshold for flagging (0-1)',
    default: 0.75,
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  threshold?: number = 0.75;
}
