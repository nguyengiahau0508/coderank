import { IsOptional, IsString, IsBoolean, IsInt, Min, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TestcaseCompareType } from '../../entities/testcases.entity';

export class UpdateTestcaseDto {
  @ApiPropertyOptional({ description: 'Input content for testcase' })
  @IsOptional()
  @IsString()
  input?: string;

  @ApiPropertyOptional({ description: 'Expected output for testcase' })
  @IsOptional()
  @IsString()
  output?: string;

  @ApiPropertyOptional({ description: 'Whether this testcase is sample' })
  @IsOptional()
  @IsBoolean()
  isSample?: boolean;

  @ApiPropertyOptional({ description: 'Whether testcase is hidden (used for judging)' })
  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;

  @ApiPropertyOptional({ description: 'Order index of testcase' })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ description: 'Compare type used to validate output', enum: TestcaseCompareType })
  @IsOptional()
  @IsEnum(TestcaseCompareType)
  compareType?: TestcaseCompareType;
}