import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProgrammingLanguageEnum } from 'src/common/enums/enums';

export class CreateContestSubmissionDto {
  @ApiProperty({ description: 'Source code', example: 'print("Hello World")' })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Programming language',
    enum: ProgrammingLanguageEnum,
    example: ProgrammingLanguageEnum.Python,
  })
  @IsEnum(ProgrammingLanguageEnum)
  language: ProgrammingLanguageEnum;
}
