import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class EnrollCourseDto {
  @ApiPropertyOptional({ description: 'Password for private courses' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  password?: string;
}
