import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { TaskStatus } from '../domain/status.enums';
import { TaskMessage, TaskRecord } from '../domain/types';
import { EventStoreService } from '../events/event-store.service';
import { TaskCreateDto } from './dto/task-create.dto';
import { TaskOutputDto } from './dto/task-output.dto';
import { TaskUpdateDto } from './dto/task-update.dto';

@Injectable()
export class TaskRegistryService {
  private readonly tasks = new Map<string, TaskRecord>();

  constructor(private readonly events: EventStoreService) {}

  create(dto: TaskCreateDto): TaskRecord {
    const now = new Date().toISOString();
    const task: TaskRecord = {
      id: randomUUID(),
      title: dto.title,
      input: dto.input,
      status: TaskStatus.CREATED,
      messages: [],
      createdAt: now,
      updatedAt: now,
    };

    this.tasks.set(task.id, task);
    return task;
  }

  get(taskId: string): TaskRecord {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new NotFoundException(`Task "${taskId}" not found`);
    }
    return task;
  }

  list(): TaskRecord[] {
    return Array.from(this.tasks.values());
  }

  stop(taskId: string): TaskRecord {
    return this.update(taskId, { status: TaskStatus.STOPPED });
  }

  update(taskId: string, dto: TaskUpdateDto): TaskRecord {
    const task = this.get(taskId);
    const updated: TaskRecord = {
      ...task,
      title: dto.title ?? task.title,
      status: dto.status ?? task.status,
      updatedAt: new Date().toISOString(),
    };

    this.tasks.set(taskId, updated);
    return updated;
  }

  appendOutput(taskId: string, dto: TaskOutputDto): TaskRecord {
    const task = this.get(taskId);
    const message: TaskMessage = {
      id: randomUUID(),
      role: dto.role ?? 'tool',
      content: dto.content,
      createdAt: new Date().toISOString(),
    };

    const updated: TaskRecord = {
      ...task,
      messages: [...task.messages, message],
      updatedAt: new Date().toISOString(),
    };

    this.tasks.set(taskId, updated);
    this.events.appendTaskMessage(taskId, message);
    return updated;
  }
}
