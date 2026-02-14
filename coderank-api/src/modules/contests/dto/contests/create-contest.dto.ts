import { IsString, IsOptional, IsDateString, IsInt, IsBoolean, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContestStatusEnum } from 'src/common/enums/enums';

export class CreateContestDto {
  @ApiProperty({ description: 'Contest title', example: 'Weekly Contest #1', maxLength: 255 })
  @IsString()
  title: string;

  @ApiProperty({ description: 'URL-friendly slug', example: 'weekly-contest-1', maxLength: 255 })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ description: 'Contest description (markdown/html)', example: 'This is a weekly coding contest' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Contest rules', example: 'No cheating allowed' })
  @IsOptional()
  @IsString()
  rules?: string;

  @ApiProperty({ description: 'Contest start time', example: '2024-01-01T00:00:00Z' })
  @IsDateString()
  startTime: Date;

  @ApiProperty({ description: 'Contest end time', example: '2024-01-01T03:00:00Z' })
  @IsDateString()
  endTime: Date;

  @ApiPropertyOptional({ description: 'Contest duration in minutes', example: 180, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @ApiPropertyOptional({ description: 'Contest status', enum: ContestStatusEnum, example: ContestStatusEnum.Draft })
  @IsOptional()
  @IsEnum(ContestStatusEnum)
  status?: ContestStatusEnum;

  @ApiPropertyOptional({ description: 'Whether the contest is public', example: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Whether the contest is rated', example: false })
  @IsOptional()
  @IsBoolean()
  isRated?: boolean;

  @ApiPropertyOptional({ description: 'Maximum number of participants (0 for unlimited)', example: 100, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxParticipants?: number;

  @ApiPropertyOptional({ description: 'Password for private contests', example: 'secret123', maxLength: 100 })
  @IsOptional()
  @IsString()
  password?: string;
}
