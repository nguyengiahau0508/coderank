import { IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TestcaseCompareTypeEnum } from 'src/common/enums/enums';

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

  @ApiPropertyOptional({
    description: 'Whether testcase is hidden (used for judging)',
  })
  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;

  @ApiPropertyOptional({
    description: 'Compare type used to validate output',
    enum: TestcaseCompareTypeEnum,
  })
  @IsOptional()
  @IsEnum(TestcaseCompareTypeEnum)
  compareType?: TestcaseCompareTypeEnum;
}

