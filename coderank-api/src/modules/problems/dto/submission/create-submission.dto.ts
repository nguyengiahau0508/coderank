import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString} from 'class-validator';
import { ProgrammingLanguageEnum } from 'src/common/enums/enums';

export class CreateSubmissionDto {
  @ApiProperty({
    description: 'Code solution',
    example: 'function solution(n) { return n * 2; }',
  })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Ngôn ngữ lập trình',
    enum: ProgrammingLanguageEnum,
    example: ProgrammingLanguageEnum.JavaScript,
  })
  @IsNotEmpty()
  @IsEnum(ProgrammingLanguageEnum)
  language: ProgrammingLanguageEnum;
}
