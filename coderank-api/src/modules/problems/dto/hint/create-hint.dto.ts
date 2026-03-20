import { IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHintDto {
  @ApiProperty({
    description: 'Content of the hint',
    example: 'Try using dynamic programming approach',
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: 'Order of the hint (lower numbers appear first)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  hintOrder?: number;

  @ApiPropertyOptional({
    description: 'Whether this hint is publicly visible',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
