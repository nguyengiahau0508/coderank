import { IsString, IsOptional, IsBoolean, IsInt, Min, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TestcaseCompareTypeEnum } from 'src/common/enums/enums';
export class CreateTestcaseDto {
  @ApiPropertyOptional({ description: 'Input content for testcase', example: '1 2\n' })
  @IsOptional()
  @IsString()
  input?: string;

  @ApiPropertyOptional({ description: 'Expected output for testcase', example: '3\n' })
  @IsOptional()
  @IsString()
  output?: string;

  @ApiPropertyOptional({ description: 'Whether this testcase is shown as sample', example: false })
  @IsOptional()
  @IsBoolean()
  isSample?: boolean;

  @ApiPropertyOptional({ description: 'Whether testcase is hidden (used for judging)', example: true })
  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;

  @ApiPropertyOptional({ description: 'Order index of testcase', example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ description: 'Compare type used to validate output', enum: TestcaseCompareTypeEnum, example: TestcaseCompareTypeEnum.Exact })
  @IsOptional()
  @IsEnum(TestcaseCompareTypeEnum)
  compareType?: TestcaseCompareTypeEnum;
}