import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { WorkerEventKind, WorkerStatus } from '../domain/status.enums';
import { WorkerRecord } from '../domain/types';
import { EventStoreService } from '../events/event-store.service';
import { WorkerCreateDto } from './dto/worker-create.dto';
import { WorkerStateMachineService } from './worker-state-machine.service';

@Injectable()
export class WorkerRegistryService {
  private readonly workers = new Map<string, WorkerRecord>();

  constructor(
    private readonly stateMachine: WorkerStateMachineService,
    private readonly events: EventStoreService,
  ) {}

  async create(dto: WorkerCreateDto): Promise<WorkerRecord> {
    const now = new Date();
    const startupTimeoutMs = dto.startupTimeoutMs ?? 30_000;
    const worker: WorkerRecord = {
      id: randomUUID(),
      name: dto.name ?? 'worker',
      status: WorkerStatus.TRUST_REQUIRED,
      trustResolved: false,
      toolPermissionGranted: false,
      startupTimeoutAt: new Date(
        now.getTime() + startupTimeoutMs,
      ).toISOString(),
      events: [
        {
          kind: WorkerEventKind.CREATED,
          createdAt: now.toISOString(),
        },
        {
          kind: WorkerEventKind.TRUST_REQUIRED,
          createdAt: now.toISOString(),
        },
      ],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    this.workers.set(worker.id, worker);
    this.events.appendWorkerEvents(worker.id, worker.events);
    await this.persistStateFile();
    return worker;
  }

  get(workerId: string): WorkerRecord {
    const worker = this.workers.get(workerId);
    if (!worker) {
      throw new NotFoundException(`Worker "${workerId}" not found`);
    }
    return worker;
  }

  list(): WorkerRecord[] {
    return Array.from(this.workers.values());
  }

  async observe(workerId: string, screenText: string): Promise<WorkerRecord> {
    const worker = this.get(workerId);
    const transition = this.stateMachine.observe(worker, screenText);
    return this.applyTransition(transition.worker, transition.events);
  }

  async resolveTrust(workerId: string): Promise<WorkerRecord> {
    const worker = this.get(workerId);
    const transition = this.stateMachine.resolveTrust(worker);
    return this.applyTransition(transition.worker, transition.events);
  }

  async grantToolPermission(workerId: string): Promise<WorkerRecord> {
    const worker = this.get(workerId);
    const transition = this.stateMachine.grantToolPermission(worker);
    return this.applyTransition(transition.worker, transition.events);
  }

  async awaitReady(workerId: string): Promise<WorkerRecord> {
    const worker = this.get(workerId);
    const transition = this.stateMachine.awaitReady(worker);
    return this.applyTransition(transition.worker, transition.events);
  }

  async sendPrompt(workerId: string, prompt: string): Promise<WorkerRecord> {
    const worker = this.get(workerId);
    if (worker.status !== WorkerStatus.READY_FOR_PROMPT) {
      throw new ConflictException(
        `Worker "${workerId}" is "${worker.status}" and not ready for prompt`,
      );
    }
    const transition = this.stateMachine.sendPrompt(worker, prompt);
    return this.applyTransition(transition.worker, transition.events);
  }

  async observeCompletion(
    workerId: string,
    screenText: string,
  ): Promise<WorkerRecord> {
    const worker = this.get(workerId);
    const transition = this.stateMachine.observeCompletion(worker, screenText);
    return this.applyTransition(transition.worker, transition.events);
  }

  async observeStartupTimeout(workerId: string): Promise<WorkerRecord> {
    const worker = this.get(workerId);
    const deadline = new Date(worker.startupTimeoutAt).getTime();
    if (Date.now() < deadline) {
      throw new ConflictException(
        `Worker "${workerId}" has not reached startup timeout`,
      );
    }

    const transition = this.stateMachine.observeStartupTimeout(worker, {
      startupTimeoutAt: worker.startupTimeoutAt,
      lastObservation: worker.lastObservation ?? null,
      statusAtTimeout: worker.status,
    });
    return this.applyTransition(transition.worker, transition.events);
  }

  private async applyTransition(
    nextWorker: WorkerRecord,
    newEvents: WorkerRecord['events'],
  ): Promise<WorkerRecord> {
    const merged: WorkerRecord = {
      ...nextWorker,
      events: [...nextWorker.events, ...newEvents],
      updatedAt: new Date().toISOString(),
    };

    this.workers.set(merged.id, merged);
    this.events.appendWorkerEvents(merged.id, newEvents);
    await this.persistStateFile();
    return merged;
  }

  private async persistStateFile(): Promise<void> {
    const clawDir = join(process.cwd(), '.claw');
    const stateFile = join(clawDir, 'worker-state.json');
    const payload = {
      updatedAt: new Date().toISOString(),
      workers: this.list(),
    };

    await mkdir(clawDir, { recursive: true });
    await writeFile(stateFile, JSON.stringify(payload, null, 2), 'utf8');
  }
}
