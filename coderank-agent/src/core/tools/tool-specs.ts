import { z } from 'zod';
import { TaskStatus } from '../../domain/status.enums';
import { ToolSpec } from './tool-contract';

export function mvpToolSpecs(): ToolSpec[] {
  return [
    {
      name: 'TaskCreate',
      description: 'Create a task',
      schema: z.object({
        title: z.string().min(1),
        input: z.unknown().optional(),
      }),
      requiredPermission: 'task.write',
    },
    {
      name: 'TaskGet',
      description: 'Get task by id',
      schema: z.object({
        taskId: z.string().min(1),
      }),
      requiredPermission: 'task.read',
    },
    {
      name: 'TaskList',
      description: 'List all tasks',
      schema: z.object({}),
      requiredPermission: 'task.read',
    },
    {
      name: 'TaskStop',
      description: 'Stop task by id',
      schema: z.object({
        taskId: z.string().min(1),
      }),
      requiredPermission: 'task.write',
    },
    {
      name: 'TaskUpdate',
      description: 'Update task status or title',
      schema: z.object({
        taskId: z.string().min(1),
        title: z.string().min(1).optional(),
        status: z.nativeEnum(TaskStatus).optional(),
      }),
      requiredPermission: 'task.write',
    },
    {
      name: 'TaskOutput',
      description: 'Append output to task',
      schema: z.object({
        taskId: z.string().min(1),
        role: z.enum(['system', 'assistant', 'tool']).optional(),
        content: z.string().min(1),
      }),
      requiredPermission: 'task.write',
    },
    {
      name: 'WorkerObserve',
      description: 'Observe worker screen text',
      schema: z.object({
        workerId: z.string().min(1),
        screenText: z.string(),
      }),
      requiredPermission: 'worker.observe',
    },
    {
      name: 'WorkerSendPrompt',
      description: 'Send prompt to worker',
      schema: z.object({
        workerId: z.string().min(1),
        prompt: z.string().min(1),
      }),
      requiredPermission: 'worker.control',
    },
    {
      name: 'ProblemCreate',
      description: 'Create a new problem in coderank-api',
      schema: z
        .object({
          title: z.string().min(1),
          slug: z.string().min(1),
          statement: z.string().min(1),
          difficulty: z.string().min(1),
          tags: z.array(z.string().min(1)).optional(),
          timeLimitMs: z.number().int().positive().optional(),
          memoryLimitMb: z.number().int().positive().optional(),
          visibility: z.string().min(1).optional(),
        })
        .passthrough(),
      requiredPermission: 'problem.write',
    },
    {
      name: 'AgentCreate',
      description: 'Create and run sub-agent in background',
      schema: z.object({
        prompt: z.string().min(1),
        systemPrompt: z.string().optional(),
        sessionId: z.string().min(1).optional(),
        subagentType: z
          .enum(['orchestrator', 'task-specialist', 'observer'])
          .optional(),
        allowedTools: z.array(z.string()).optional(),
      }),
      requiredPermission: 'agent.spawn',
    },
    {
      name: 'AgentGet',
      description: 'Get agent by id',
      schema: z.object({
        agentId: z.string().min(1),
      }),
      requiredPermission: 'agent.read',
    },
    {
      name: 'AgentStop',
      description: 'Stop agent by id',
      schema: z.object({
        agentId: z.string().min(1),
      }),
      requiredPermission: 'agent.spawn',
    },
  ];
}
