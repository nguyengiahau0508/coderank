import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { ConversationMessageEntity } from './conversation-message.entity';

@Entity('conversations')
export class ConversationEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255, default: 'New Chat' })
  title: string;

  @OneToMany(() => ConversationMessageEntity, (msg) => msg.conversation, {
    cascade: true,
  })
  messages: ConversationMessageEntity[];
}
