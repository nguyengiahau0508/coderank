import { Injectable } from '@nestjs/common';
import { TaskMessage, WorkerEvent } from '../domain/types';

@Injectable()
export class EventStoreService {
  private readonly workerEvents = new Map<string, WorkerEvent[]>();
  private readonly taskMessages = new Map<string, TaskMessage[]>();

  appendWorkerEvents(workerId: string, events: WorkerEvent[]): void {
    const current = this.workerEvents.get(workerId) ?? [];
    this.workerEvents.set(workerId, [...current, ...events]);
  }

  getWorkerEvents(workerId: string): WorkerEvent[] {
    return [...(this.workerEvents.get(workerId) ?? [])];
  }

  appendTaskMessage(taskId: string, message: TaskMessage): void {
    const current = this.taskMessages.get(taskId) ?? [];
    this.taskMessages.set(taskId, [...current, message]);
  }

  getTaskMessages(taskId: string): TaskMessage[] {
    return [...(this.taskMessages.get(taskId) ?? [])];
  }
}
