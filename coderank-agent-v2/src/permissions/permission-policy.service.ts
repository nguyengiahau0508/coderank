import { ForbiddenException, Injectable } from '@nestjs/common';
import { SubagentType } from '../domain/status.enums';

export type ToolPermission =
  | 'task.read'
  | 'task.write'
  | 'worker.observe'
  | 'worker.control'
  | 'agent.spawn'
  | 'agent.read'
  | 'problem.write';

export interface ToolExecutionContext {
  role: 'root' | 'subagent';
  subagentType?: SubagentType;
  allowedTools?: string[];
  accessToken?: string;
}

@Injectable()
export class PermissionPolicyService {
  private readonly subagentToolMap: Record<SubagentType, string[]> = {
    orchestrator: [
      'TaskCreate',
      'TaskGet',
      'TaskList',
      'TaskStop',
      'TaskUpdate',
      'TaskOutput',
      'WorkerObserve',
      'WorkerSendPrompt',
      'ProblemCreate',
      'AgentCreate',
      'AgentGet',
    ],
    'task-specialist': [
      'TaskCreate',
      'TaskGet',
      'TaskList',
      'TaskUpdate',
      'TaskOutput',
      'ProblemCreate',
    ],
    observer: ['TaskGet', 'TaskList', 'WorkerObserve', 'AgentGet'],
  };

  private readonly permissionByTool: Record<string, ToolPermission> = {
    TaskCreate: 'task.write',
    TaskGet: 'task.read',
    TaskList: 'task.read',
    TaskStop: 'task.write',
    TaskUpdate: 'task.write',
    TaskOutput: 'task.write',
    WorkerObserve: 'worker.observe',
    WorkerSendPrompt: 'worker.control',
    AgentCreate: 'agent.spawn',
    AgentGet: 'agent.read',
    AgentStop: 'agent.spawn',
    ProblemCreate: 'problem.write',
  };

  allowedToolsForSubagent(type: SubagentType): string[] {
    return [...this.subagentToolMap[type]];
  }

  assertToolAllowed(
    toolName: string,
    requiredPermission: ToolPermission,
    context: ToolExecutionContext,
  ): void {
    if (context.role === 'root') {
      return;
    }

    const allowedTools =
      context.allowedTools ??
      this.allowedToolsForSubagent(context.subagentType ?? 'observer');
    if (!allowedTools.includes(toolName)) {
      throw new ForbiddenException(
        `Tool "${toolName}" is not allowed for this subagent`,
      );
    }

    const resolvedPermission = this.permissionByTool[toolName];
    if (resolvedPermission !== requiredPermission) {
      throw new ForbiddenException(
        `Tool "${toolName}" does not satisfy permission "${requiredPermission}"`,
      );
    }
  }
}
