import { IsOptional, IsEnum, IsInt, Min, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ContestStatusEnum } from 'src/common/enums/enums';

export class PaginationQueryContestsDto {
  @ApiPropertyOptional({ description: 'Page number', example: 1, minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', example: 10, minimum: 1, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Search by title or slug', example: 'weekly' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by status', enum: ContestStatusEnum, example: ContestStatusEnum.Running })
  @IsOptional()
  @IsEnum(ContestStatusEnum)
  status?: ContestStatusEnum;

  @ApiPropertyOptional({ description: 'Filter by public/private', example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Filter by rated/unrated', example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isRated?: boolean;
}
