import { z } from 'zod';
import { ToolPermission } from '../../permissions/permission-policy.service';

export interface ToolSpec<TInput extends z.ZodTypeAny = z.ZodTypeAny> {
  name: string;
  description: string;
  schema: TInput;
  requiredPermission: ToolPermission;
}

export interface ToolExecutionResult {
  toolName: string;
  output: unknown;
}
