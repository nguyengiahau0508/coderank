import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TestcaseCompareTypeEnum } from 'src/common/enums/enums';
export class CreateTestcaseDto {
  @ApiPropertyOptional({
    description: 'Input content for testcase',
    example: '1 2\n',
  })
  @IsOptional()
  @IsString()
  input?: string;

  @ApiPropertyOptional({
    description: 'Expected output for testcase',
    example: '3\n',
  })
  @IsOptional()
  @IsString()
  expectedOutput?: string;

  @ApiPropertyOptional({
    description: 'Whether this testcase is shown as sample',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isSample?: boolean;

  @ApiPropertyOptional({
    description: 'Compare type used to validate output',
    enum: TestcaseCompareTypeEnum,
    example: TestcaseCompareTypeEnum.Exact,
  })
  @IsOptional()
  @IsEnum(TestcaseCompareTypeEnum)
  compareType?: TestcaseCompareTypeEnum;
}

