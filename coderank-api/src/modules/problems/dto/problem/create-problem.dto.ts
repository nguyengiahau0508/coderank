import { IsNotEmpty, IsOptional, IsString, IsInt, Min, MaxLength, IsBoolean, IsUUID, IsArray, ArrayUnique, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DifficultyEnum } from 'src/common/enums/enums';
import { CreateTestcaseDto } from '../testcase/create-testcase.dto';

export class CreateProblemDto {
  @ApiProperty({ description: 'Problem title', example: 'Sum of Two', maxLength: 255 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ description: 'URL-friendly slug (auto-generated from title if omitted)', example: 'sum-of-two' })
  @IsString()
  @MaxLength(255)
  slug: string;

  @ApiPropertyOptional({ description: 'Full problem statement (markdown/html)' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Input description' })
  @IsOptional()
  @IsString()
  inputDescription?: string;

  @ApiPropertyOptional({ description: 'Output description' })
  @IsOptional()
  @IsString()
  outputDescription?: string;

  @ApiPropertyOptional({ description: 'Time limit (ms)', example: 1000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  timeLimitMs?: number;

  @ApiPropertyOptional({ description: 'Memory limit (MB)', example: 256 })
  @IsOptional()
  @IsInt()
  @Min(0)
  memoryLimitMb?: number;

  @ApiPropertyOptional({ description: 'Difficulty', enum: DifficultyEnum, example: DifficultyEnum.Medium })
  @IsOptional()
  @IsEnum(DifficultyEnum)
  difficulty?: DifficultyEnum;

  @ApiPropertyOptional({ description: 'Whether the problem is published', example: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ description: 'Points awarded for full solve', example: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;

  // @ApiPropertyOptional({ description: 'Array of tag IDs to associate', type: [String] })
  // @IsOptional()
  // @IsArray()
  // @ArrayUnique()
  // @IsUUID('4', { each: true })
  // tagIds?: string[];

  // @ApiPropertyOptional({ description: 'Inline testcases to create', type: [CreateTestcaseDto] })
  // @IsOptional()
  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => CreateTestcaseDto)
  // testcases?: CreateTestcaseDto[];
}