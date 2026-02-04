// coderunner/dto/run-code.dto.ts
import { IsEnum, IsString, IsOptional } from "class-validator";
import { LanguageEnum } from "src/common/enums/enums";
import { ApiEnumProperty, ApiStringProperty, ApiIntProperty } from 'src/common/decorators/api-property.decorator';

export class RunCodeDto {
  @ApiEnumProperty('Programming language', LanguageEnum, 'LanguageEnum', undefined, LanguageEnum.PYTHON)
  @IsEnum(LanguageEnum)
  language: LanguageEnum;

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
