import { IsOptional, IsString, IsArray, IsEnum, IsUUID, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DifficultyEnum } from 'src/common/enums/enums';
import { PaginationQueryDto } from 'src/common/dto';

export class PaginationQueryProblemsDto extends PaginationQueryDto{
  @ApiPropertyOptional({ description: 'Filter by difficulty', enum: DifficultyEnum })
  @IsOptional()
  @IsEnum(DifficultyEnum)
  difficulty?: DifficultyEnum;

  @ApiPropertyOptional({ description: 'Filter by tag IDs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];

  @ApiPropertyOptional({ description: 'Only published problems' })
  @IsOptional()
  isPublished?: boolean;

  @ApiPropertyOptional({ description: 'Filter by minimum points' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  minPoints: number;

  @ApiPropertyOptional({ description: 'Filter by maximum points' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  maxPoints: number;
}