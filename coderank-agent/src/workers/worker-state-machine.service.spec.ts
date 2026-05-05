import { WorkerStatus } from '../domain/status.enums';
import { WorkerRecord } from '../domain/types';
import { WorkerStateMachineService } from './worker-state-machine.service';

function createWorker(partial: Partial<WorkerRecord> = {}): WorkerRecord {
  const now = new Date().toISOString();
  return {
    id: 'worker-1',
    name: 'test-worker',
    status: WorkerStatus.TRUST_REQUIRED,
    trustResolved: false,
    toolPermissionGranted: false,
    startupTimeoutAt: new Date(Date.now() + 30_000).toISOString(),
    events: [],
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

describe('WorkerStateMachineService', () => {
  let service: WorkerStateMachineService;

  beforeEach(() => {
    service = new WorkerStateMachineService();
  });

  it('moves trust_required to tool_permission_required after trust resolution', () => {
    const worker = createWorker();
    const transition = service.resolveTrust(worker);

    expect(transition.worker.trustResolved).toBe(true);
    expect(transition.worker.status).toBe(
      WorkerStatus.TOOL_PERMISSION_REQUIRED,
    );
    expect(transition.events.map((event) => event.kind)).toEqual([
      'trust_resolved',
      'tool_permission_required',
    ]);
  });

  it('becomes ready_for_prompt after both gates are resolved', () => {
    const worker = createWorker({
      trustResolved: true,
      toolPermissionGranted: false,
      status: WorkerStatus.TOOL_PERMISSION_REQUIRED,
    });
    const transition = service.grantToolPermission(worker);

    expect(transition.worker.status).toBe(WorkerStatus.READY_FOR_PROMPT);
    expect(transition.worker.toolPermissionGranted).toBe(true);
  });

  it('detects prompt misdelivery and queues replay', () => {
    const worker = createWorker({
      status: WorkerStatus.PROMPT_IN_FLIGHT,
      currentPrompt: 'run build',
      trustResolved: true,
      toolPermissionGranted: true,
    });
    const transition = service.observe(
      worker,
      'terminal shows unrelated output',
    );

    expect(transition.worker.status).toBe(WorkerStatus.READY_FOR_PROMPT);
    expect(transition.worker.queuedReplayPrompt).toBe('run build');
    expect(transition.worker.currentPrompt).toBeUndefined();
  });

  it('classifies provider failure from completion observation', () => {
    const worker = createWorker({
      status: WorkerStatus.PROMPT_IN_FLIGHT,
    });
    const transition = service.observeCompletion(
      worker,
      'provider_error: timeout',
    );

    expect(transition.worker.status).toBe(WorkerStatus.PROVIDER_FAILURE);
    expect(transition.worker.failureKind).toBe('provider_failure');
  });
});
