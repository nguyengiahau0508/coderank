import { IsOptional, IsString, IsArray, IsEnum, IsUUID, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DifficultyEnum } from 'src/common/enums/enums';
import { PaginationQueryDto } from 'src/common/dto';
import { Transform } from 'class-transformer';

export class PaginationQueryProblemsDto extends PaginationQueryDto{
  @ApiPropertyOptional({ description: 'Filter by difficulty', enum: DifficultyEnum })
  @IsOptional()
  @IsEnum(DifficultyEnum)
  difficulty?: DifficultyEnum;

  @ApiPropertyOptional({ description: 'Filter by tag IDs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(id => id.trim());
    }
    return value;
  })
  tagIds?: string[];

  @ApiPropertyOptional({ description: 'Only published problems', type: Boolean })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  isPublished?: boolean;

  @ApiPropertyOptional({ description: 'Filter by minimum points', minimum: 0, maximum: 1000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  @Transform(({ value }) => value ? parseInt(value, 10) : undefined)
  minPoints?: number;

  @ApiPropertyOptional({ description: 'Filter by maximum points', minimum: 0, maximum: 1000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  @Transform(({ value }) => value ? parseInt(value, 10) : undefined)
  maxPoints?: number;
}