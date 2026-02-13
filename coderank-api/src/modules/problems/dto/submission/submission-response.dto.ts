import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ProgrammingLanguageEnum,
  SubmissionStatusEnum,
} from 'src/common/enums/enums';

export class SubmissionResponseDto {
  @ApiProperty({
    description: 'ID của submission',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'ID của problem',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  problemId: string;

  @ApiProperty({
    description: 'Code solution',
    example: 'function solution(n) { return n * 2; }',
  })
  code: string;

  @ApiProperty({
    description: 'Ngôn ngữ lập trình',
    enum: ProgrammingLanguageEnum,
    example: ProgrammingLanguageEnum.JavaScript,
  })
  language: ProgrammingLanguageEnum;

  @ApiProperty({
    description: 'Trạng thái của submission',
    enum: SubmissionStatusEnum,
    example: SubmissionStatusEnum.Accepted,
  })
  status: SubmissionStatusEnum;

  @ApiProperty({
    description: 'Điểm số đạt được',
    example: 100,
  })
  score: number;

  @ApiPropertyOptional({
    description: 'Thời gian thực thi (ms)',
    example: 150,
  })
  executionTimeMs?: number;

  @ApiPropertyOptional({
    description: 'Bộ nhớ sử dụng (MB)',
    example: 50,
  })
  memoryUsedMb?: number;

  @ApiProperty({
    description: 'Số testcase pass',
    example: 10,
  })
  passedTestcases: number;

  @ApiProperty({
    description: 'Tổng số testcase',
    example: 10,
  })
  totalTestcases: number;

  @ApiPropertyOptional({
    description: 'Thông báo lỗi nếu có',
    example: 'Runtime error: Division by zero',
  })
  errorMessage?: string;

  @ApiPropertyOptional({
    description: 'Output của submission',
    example: '42',
  })
  output?: string;

  @ApiProperty({
    description: 'ID của tác giả',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  authorId: string;

  @ApiProperty({
    description: 'Thời gian tạo',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
