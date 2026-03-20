import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsObject,
  ValidateNested,
  IsIn,
  IsArray,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ApiStringProperty } from 'src/common/decorators/api-property.decorator';
import { AiProviderEnum } from 'src/common/enums/enums';
import { Type } from 'class-transformer';

export class ChatContextDto {
  @ApiStringProperty('Context type', 'problem')
  @IsString()
  @IsIn(['problem', 'course', 'lesson', 'contest', 'submission'])
  type: 'problem' | 'course' | 'lesson' | 'contest' | 'submission';

  @ApiStringProperty('Title of the current context', 'Two Sum')
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Description or additional info' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ description: 'Problem ID (for problem context)' })
  @IsOptional()
  @IsString()
  problemId?: string;

  @ApiPropertyOptional({ description: 'Problem difficulty' })
  @IsOptional()
  @IsString()
  difficulty?: string;

  @ApiPropertyOptional({ description: 'Problem tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Current user code' })
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  userCode?: string;

  @ApiPropertyOptional({ description: 'Last submission status' })
  @IsOptional()
  @IsString()
  lastSubmissionStatus?: string;

  @ApiPropertyOptional({ description: 'Course ID (for course context)' })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiPropertyOptional({ description: 'Course level' })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({ description: 'Current lesson title' })
  @IsOptional()
  @IsString()
  currentLessonTitle?: string;

  @ApiPropertyOptional({ description: 'Lesson ID (for lesson context)' })
  @IsOptional()
  @IsString()
  lessonId?: string;

  @ApiPropertyOptional({ description: 'Course title (for lesson context)' })
  @IsOptional()
  @IsString()
  courseTitle?: string;

  @ApiPropertyOptional({ description: 'Contest ID (for contest context)' })
  @IsOptional()
  @IsString()
  contestId?: string;

  @ApiPropertyOptional({ description: 'Current problem title in contest' })
  @IsOptional()
  @IsString()
  currentProblemTitle?: string;

  @ApiPropertyOptional({
    description: 'Submission ID (for submission context)',
  })
  @IsOptional()
  @IsString()
  submissionId?: string;

  @ApiPropertyOptional({
    description: 'Problem title (for submission context)',
  })
  @IsOptional()
  @IsString()
  problemTitle?: string;

  @ApiPropertyOptional({ description: 'Submission status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Programming language' })
  @IsOptional()
  @IsString()
  language?: string;
}

export class ChatMessageDto {
  @ApiStringProperty(
    'User message to the AI agent',
    'Giúp tôi giải bài Two Sum',
    2000,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string;

  @ApiPropertyOptional({
    description: 'AI provider to use for this message',
    enum: AiProviderEnum,
    enumName: 'AiProviderEnum',
    example: AiProviderEnum.Gemini,
  })
  @IsOptional()
  @IsEnum(AiProviderEnum)
  provider?: AiProviderEnum;

  @ApiPropertyOptional({
    description: 'Current user context (problem, course, contest, etc.)',
    type: ChatContextDto,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ChatContextDto)
  context?: ChatContextDto;
}
