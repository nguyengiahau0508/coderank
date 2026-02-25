import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsInt, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSectionDto {
  @ApiProperty({ description: 'Section title', example: 'Chương 1: Mảng và Chuỗi', maxLength: 255 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ description: 'Section description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Display order', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sectionOrder?: number;

  @ApiPropertyOptional({ description: 'Whether published', example: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
