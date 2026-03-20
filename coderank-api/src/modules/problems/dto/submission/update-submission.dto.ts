import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import {
  ProgrammingLanguageEnum,
  SubmissionStatusEnum,
} from 'src/common/enums/enums';

export class UpdateSubmissionDto {
  @ApiPropertyOptional({
    description: 'Code solution',
    example: 'function solution(n) { return n * 2; }',
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    description: 'Ngôn ngữ lập trình',
    enum: ProgrammingLanguageEnum,
    example: ProgrammingLanguageEnum.JavaScript,
  })
  @IsOptional()
  @IsEnum(ProgrammingLanguageEnum)
  language?: ProgrammingLanguageEnum;

  @ApiPropertyOptional({
    description: 'Trạng thái của submission',
    enum: SubmissionStatusEnum,
    example: SubmissionStatusEnum.Accepted,
  })
  @IsOptional()
  @IsEnum(SubmissionStatusEnum)
  status?: SubmissionStatusEnum;

  @ApiPropertyOptional({
    description: 'Điểm số đạt được',
    example: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  score?: number;

  @ApiPropertyOptional({
    description: 'Thời gian thực thi (ms)',
    example: 150,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  executionTimeMs?: number;

  @ApiPropertyOptional({
    description: 'Bộ nhớ sử dụng (MB)',
    example: 50,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  memoryUsedMb?: number;

  @ApiPropertyOptional({
    description: 'Số testcase pass',
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  passedTestcases?: number;

  @ApiPropertyOptional({
    description: 'Tổng số testcase',
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  totalTestcases?: number;

  @ApiPropertyOptional({
    description: 'Thông báo lỗi nếu có',
    example: 'Runtime error: Division by zero',
  })
  @IsOptional()
  @IsString()
  errorMessage?: string;

  @ApiPropertyOptional({
    description: 'Output của submission',
    example: '42',
  })
  @IsOptional()
  @IsString()
  output?: string;
}
