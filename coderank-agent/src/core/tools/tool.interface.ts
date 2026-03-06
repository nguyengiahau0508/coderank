import { ZodTypeAny } from 'zod';

export interface ITool {
  name: string;
  description: string;
  parameters: ZodTypeAny;

  /**
   * Executes the tool logic.
   * @param args The arguments parsed from the LLM tool call
   * @param client The internal API client for backend requests
   */
  execute(args: any, client: any): Promise<any>;
}
