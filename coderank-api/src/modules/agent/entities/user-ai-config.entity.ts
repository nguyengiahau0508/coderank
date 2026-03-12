import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { AiProviderEnum } from 'src/common/enums/enums';
import {
  ApiEnumProperty,
  ApiStringProperty,
  ApiStringOptional,
} from 'src/common/decorators';

@Entity('user_ai_configs')
@Index(['authorId'], { unique: true })
export class UserAiConfigEntity extends BaseEntity {
  @ApiEnumProperty(
    'AI provider',
    AiProviderEnum,
    'AiProviderEnum',
    AiProviderEnum.Gemini,
    AiProviderEnum.Gemini,
  )
  @Column({
    type: 'enum',
    enum: AiProviderEnum,
    default: AiProviderEnum.Gemini,
  })
  provider: AiProviderEnum;

  @ApiStringOptional('Model name (e.g. gemini-2.5-flash, llama-3.3-70b-versatile)', 'gemini-2.5-flash', 100)
  @Column({ type: 'varchar', length: 100, nullable: true })
  modelName: string;

  @ApiStringOptional('API key for the selected provider', '', 500)
  @Column({ type: 'varchar', length: 500, nullable: true, select: false })
  apiKey: string;

  @ApiStringOptional('Base host URL (for Ollama)', 'http://localhost:11434', 255)
  @Column({ type: 'varchar', length: 255, nullable: true })
  baseHost: string;
}
