import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ApiStringProperty } from 'src/common/decorators/api-property.decorator';
import { AiProviderEnum } from 'src/common/enums/enums';

export class ChatMessageDto {
  @ApiStringProperty('User message to the AI agent', 'Giúp tôi giải bài Two Sum', 2000)
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string;

  @ApiPropertyOptional({
    description: 'AI provider to use for this message',
    enum: AiProviderEnum,
    enumName: 'AiProviderEnum',
    example: AiProviderEnum.Gemini,
  })
  @IsOptional()
  @IsEnum(AiProviderEnum)
  provider?: AiProviderEnum;
}
