import { Test, TestingModule } from '@nestjs/testing';
import { AgentService } from '../../agents/agents.service';
import { CoderankProblemsApiService } from '../../api/coderank-problems-api.service';
import { EventStoreService } from '../../events/event-store.service';
import { PermissionPolicyService } from '../../permissions/permission-policy.service';
import { PROVIDER_RUNTIME_CLIENT } from '../llm/provider-runtime-client';
import { MockProviderRuntimeClient } from '../llm/mock-provider.client';
import { ToolDispatcherService } from '../tools/tool-dispatcher.service';
import { TaskRegistryService } from '../../tasks/task-registry.service';
import { SessionContextService } from '../../sessions/session-context.service';
import { WorkerRegistryService } from '../../workers/worker-registry.service';
import { WorkerStateMachineService } from '../../workers/worker-state-machine.service';
import { RuntimeLoopService } from './runtime-loop.service';

describe('RuntimeLoopService', () => {
  let runtime: RuntimeLoopService;
  let tasks: TaskRegistryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventStoreService,
        PermissionPolicyService,
        TaskRegistryService,
        SessionContextService,
        WorkerStateMachineService,
        WorkerRegistryService,
        CoderankProblemsApiService,
        AgentService,
        ToolDispatcherService,
        RuntimeLoopService,
        {
          provide: PROVIDER_RUNTIME_CLIENT,
          useClass: MockProviderRuntimeClient,
        },
      ],
    }).compile();

    runtime = module.get(RuntimeLoopService);
    tasks = module.get(TaskRegistryService);
  });

  it('executes tool call and continues with tool result', async () => {
    const result = await runtime.runTurn({
      prompt: '@tool TaskCreate {"title":"build architecture"}',
      allowedTools: ['TaskCreate'],
      subagentType: 'orchestrator',
      maxTurns: 3,
    });

    const allTasks = tasks.list();
    expect(allTasks).toHaveLength(1);
    expect(allTasks[0]?.title).toBe('build architecture');
    expect(result.finalMessage).toContain('Tool TaskCreate executed');
  });
});
