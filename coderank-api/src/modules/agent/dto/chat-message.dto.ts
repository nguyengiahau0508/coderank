import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiStringProperty } from 'src/common/decorators/api-property.decorator';

export class ChatMessageDto {
  @ApiStringProperty('User message to the AI agent', 'Giúp tôi giải bài Two Sum', 2000)
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string;
}
