import { ZodTypeAny } from 'zod';
import type { AxiosInstance } from 'axios';

export type IApiClient = AxiosInstance;

export interface ITool {
  name: string;
  description: string;
  parameters: ZodTypeAny;
  execute(args: unknown, client: IApiClient): Promise<unknown>;
}
