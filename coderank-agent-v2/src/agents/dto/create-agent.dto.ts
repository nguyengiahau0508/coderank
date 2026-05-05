import { SubagentType } from '../../domain/status.enums';

export class CreateAgentDto {
  prompt!: string;
  systemPrompt?: string;
  sessionId?: string;
  subagentType?: SubagentType;
  allowedTools?: string[];
}
