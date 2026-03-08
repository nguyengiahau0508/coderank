import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateTestcaseDto } from './create-testcase.dto';

export class CreateTestcasesDto {
  @ApiProperty({
    description: 'Array of testcases to create',
    type: [CreateTestcaseDto],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateTestcaseDto)
  testcases: CreateTestcaseDto[];
}
