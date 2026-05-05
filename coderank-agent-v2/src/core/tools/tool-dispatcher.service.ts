import { BadRequestException, Injectable } from '@nestjs/common';
import { AgentService } from '../../agents/agents.service';
import {
  CoderankProblemsApiService,
  CreateProblemPayload,
} from '../../api/coderank-problems-api.service';
import {
  PermissionPolicyService,
  ToolExecutionContext,
} from '../../permissions/permission-policy.service';
import { TaskRegistryService } from '../../tasks/task-registry.service';
import { WorkerRegistryService } from '../../workers/worker-registry.service';
import { ToolExecutionResult, ToolSpec } from './tool-contract';
import { mvpToolSpecs } from './tool-specs';

@Injectable()
export class ToolDispatcherService {
  private readonly toolSpecs = new Map<string, ToolSpec>(
    mvpToolSpecs().map((spec) => [spec.name, spec]),
  );

  constructor(
    private readonly permissions: PermissionPolicyService,
    private readonly tasks: TaskRegistryService,
    private readonly workers: WorkerRegistryService,
    private readonly agents: AgentService,
    private readonly problemsApi: CoderankProblemsApiService,
  ) {}

  async execute(
    toolName: string,
    payload: unknown,
    context: ToolExecutionContext,
  ): Promise<ToolExecutionResult> {
    const spec = this.toolSpecs.get(toolName);
    if (!spec) {
      throw new BadRequestException(`Unknown tool "${toolName}"`);
    }

    const parsed = spec.schema.safeParse(payload);
    if (!parsed.success) {
      throw new BadRequestException({
        error: `Invalid payload for "${toolName}"`,
        issues: parsed.error.issues,
      });
    }

    this.permissions.assertToolAllowed(
      toolName,
      spec.requiredPermission,
      context,
    );
    const output = await this.route(
      toolName,
      parsed.data as Record<string, unknown>,
      context,
    );
    return {
      toolName,
      output,
    };
  }

  getToolSpecs(): ToolSpec[] {
    return [...this.toolSpecs.values()];
  }

  private route(
    toolName: string,
    payload: Record<string, unknown>,
    context: ToolExecutionContext,
  ) {
    switch (toolName) {
      case 'TaskCreate':
        return Promise.resolve(
          this.tasks.create({
            title: payload.title as string,
            input: payload.input,
          }),
        );
      case 'TaskGet':
        return Promise.resolve(this.tasks.get(payload.taskId as string));
      case 'TaskList':
        return Promise.resolve(this.tasks.list());
      case 'TaskStop':
        return Promise.resolve(this.tasks.stop(payload.taskId as string));
      case 'TaskUpdate':
        return Promise.resolve(
          this.tasks.update(payload.taskId as string, {
            title: payload.title as string | undefined,
            status: payload.status as never,
          }),
        );
      case 'TaskOutput':
        return Promise.resolve(
          this.tasks.appendOutput(payload.taskId as string, {
            role: payload.role as 'system' | 'assistant' | 'tool' | undefined,
            content: payload.content as string,
          }),
        );
      case 'WorkerObserve':
        return this.workers.observe(
          payload.workerId as string,
          payload.screenText as string,
        );
      case 'WorkerSendPrompt':
        return this.workers.sendPrompt(
          payload.workerId as string,
          payload.prompt as string,
        );
      case 'ProblemCreate':
        return this.problemsApi.createProblem(
          payload as CreateProblemPayload,
          context.accessToken,
        );
      case 'AgentCreate':
        return this.agents.createAndStart(
          {
            prompt: payload.prompt as string,
            systemPrompt: payload.systemPrompt as string | undefined,
            sessionId: payload.sessionId as string | undefined,
            subagentType: payload.subagentType as
              | 'orchestrator'
              | 'task-specialist'
              | 'observer'
              | undefined,
            allowedTools: payload.allowedTools as string[] | undefined,
          },
          {
            accessToken: context.accessToken,
          },
        );
      case 'AgentGet':
        return Promise.resolve(this.agents.get(payload.agentId as string));
      case 'AgentStop':
        return this.agents.stop(payload.agentId as string);
      default:
        throw new BadRequestException(`No handler for tool "${toolName}"`);
    }
  }
}
