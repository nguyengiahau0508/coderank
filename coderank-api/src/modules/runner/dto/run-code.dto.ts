// coderunner/dto/run-code.dto.ts
import { IsEnum, IsString, IsOptional } from 'class-validator';
import {
  ApiEnumProperty,
  ApiStringProperty,
  ApiIntProperty,
} from 'src/common/decorators/api-property.decorator';
import { ProgrammingLanguageEnum } from 'src/common/enums/enums';

export class RunCodeDto {
  @ApiEnumProperty(
    'Programming language',
    ProgrammingLanguageEnum,
    'ProgrammingLanguageEnum',
    undefined,
    ProgrammingLanguageEnum.Python,
  )
  @IsEnum(ProgrammingLanguageEnum)
  language: ProgrammingLanguageEnum;

  @ApiStringProperty('Source code', 'print("Hello world")')
  @IsString()
  code: string;

  @ApiStringProperty('Standard input', '')
  @IsString()
  input: string;

  @ApiIntProperty('Time limit (ms)', 2000)
  @IsOptional()
  timeLimit?: number; // ms

  @ApiIntProperty('Memory limit (MB)', 256)
  @IsOptional()
  memoryLimit?: number; // MB
}
