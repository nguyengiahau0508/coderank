import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProgrammingLanguageEnum } from 'src/common/enums/enums';

export class CreateSolutionDto {
  @ApiProperty({
    description: 'Tiêu đề giải pháp',
    example: 'Dynamic Programming O(n) solution',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Mô tả / giải thích cách giải',
    example: 'Sử dụng mảng dp để lưu trạng thái...',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Source code của giải pháp',
    example: 'def solve(n): ...',
  })
  @IsString()
  code: string;

  @ApiPropertyOptional({
    description: 'Ngôn ngữ lập trình',
    enum: ProgrammingLanguageEnum,
    example: ProgrammingLanguageEnum.Python,
  })
  @IsOptional()
  @IsEnum(ProgrammingLanguageEnum)
  language?: ProgrammingLanguageEnum;
}
