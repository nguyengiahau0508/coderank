import {
  IsOptional,
  IsString,
  IsBoolean,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLessonProblemDto {
  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  @IsInt()
  @Min(0)
  problemOrder?: number;

  @ApiPropertyOptional({ description: 'Whether required' })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional({ description: 'Custom label', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  label?: string;
}
