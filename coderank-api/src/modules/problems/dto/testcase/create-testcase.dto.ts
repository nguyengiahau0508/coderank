import { IsString, IsOptional, IsBoolean, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TestcaseCompareTypeEnum } from 'src/common/enums/enums';
export class CreateTestcaseDto {
  @ApiProperty({
    description: 'Input content for testcase',
    example: '1 2\n',
  })
  @IsNotEmpty()
  @IsString()
  input: string;

  @ApiProperty({
    description: 'Expected output for testcase',
    example: '3\n',
  })
  @IsNotEmpty()
  @IsString()
  expectedOutput: string;

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

