import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import {
  ApiEnumProperty,
  ApiStringOptional,
} from 'src/common/decorators';
import { AiProviderEnum } from 'src/common/enums/enums';

export class UpsertAiConfigDto {
  @ApiEnumProperty(
    'AI provider',
    AiProviderEnum,
    'AiProviderEnum',
    AiProviderEnum.Gemini,
    AiProviderEnum.Gemini,
  )
  @IsEnum(AiProviderEnum)
  provider: AiProviderEnum;

  @ApiStringOptional('Model name', 'gemini-2.5-flash', 100)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  modelName?: string;

  @ApiStringOptional('API key for the selected provider', '')
  @IsOptional()
  @IsString()
  @MaxLength(500)
  apiKey?: string;

  @ApiStringOptional('Base host URL (for Ollama)', 'http://localhost:11434', 255)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  baseHost?: string;
}
