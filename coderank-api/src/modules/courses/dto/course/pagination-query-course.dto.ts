import { IsOptional, IsEnum, IsBoolean, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CourseLevelEnum, CourseStatusEnum } from 'src/common/enums/enums';
import { PaginationQueryDto } from 'src/common/dto';
import { Transform } from 'class-transformer';

export class PaginationQueryCoursesDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by level',
    enum: CourseLevelEnum,
  })
  @IsOptional()
  @IsEnum(CourseLevelEnum)
  level?: CourseLevelEnum;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: CourseStatusEnum,
  })
  @IsOptional()
  @IsEnum(CourseStatusEnum)
  status?: CourseStatusEnum;

  @ApiPropertyOptional({ description: 'Filter by visibility', type: Boolean })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Filter by category' })
  @IsOptional()
  @IsString()
  category?: string;
}
