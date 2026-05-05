import { Injectable } from '@nestjs/common';
import {
  WorkerEventKind,
  WorkerFailureKind,
  WorkerStatus,
} from '../domain/status.enums';
import { WorkerEvent, WorkerRecord } from '../domain/types';

interface TransitionResult {
  worker: WorkerRecord;
  events: WorkerEvent[];
}

@Injectable()
export class WorkerStateMachineService {
  observe(worker: WorkerRecord, screenText: string): TransitionResult {
    const updated: WorkerRecord = {
      ...worker,
      lastObservation: screenText,
      updatedAt: new Date().toISOString(),
    };
    const events: WorkerEvent[] = [
      this.event(WorkerEventKind.OBSERVED, { screenText }),
    ];

    if (
      updated.status === WorkerStatus.PROMPT_IN_FLIGHT &&
      updated.currentPrompt &&
      !screenText.includes(updated.currentPrompt)
    ) {
      updated.queuedReplayPrompt = updated.currentPrompt;
      updated.currentPrompt = undefined;
      updated.status = WorkerStatus.READY_FOR_PROMPT;
      events.push(this.event(WorkerEventKind.PROMPT_MISDELIVERY_DETECTED));
      events.push(this.event(WorkerEventKind.PROMPT_REPLAY_QUEUED));
    }

    return { worker: updated, events };
  }

  resolveTrust(worker: WorkerRecord): TransitionResult {
    const updated: WorkerRecord = {
      ...worker,
      trustResolved: true,
      updatedAt: new Date().toISOString(),
    };
    const events: WorkerEvent[] = [this.event(WorkerEventKind.TRUST_RESOLVED)];

    if (!updated.toolPermissionGranted) {
      updated.status = WorkerStatus.TOOL_PERMISSION_REQUIRED;
      events.push(this.event(WorkerEventKind.TOOL_PERMISSION_REQUIRED));
    } else {
      updated.status = WorkerStatus.READY_FOR_PROMPT;
      events.push(this.event(WorkerEventKind.READY_FOR_PROMPT));
    }

    return { worker: updated, events };
  }

  grantToolPermission(worker: WorkerRecord): TransitionResult {
    const updated: WorkerRecord = {
      ...worker,
      toolPermissionGranted: true,
      updatedAt: new Date().toISOString(),
    };
    const events: WorkerEvent[] = [
      this.event(WorkerEventKind.TOOL_PERMISSION_GRANTED),
    ];

    if (!updated.trustResolved) {
      updated.status = WorkerStatus.TRUST_REQUIRED;
      events.push(this.event(WorkerEventKind.TRUST_REQUIRED));
    } else {
      updated.status = WorkerStatus.READY_FOR_PROMPT;
      events.push(this.event(WorkerEventKind.READY_FOR_PROMPT));
    }

    return { worker: updated, events };
  }

  awaitReady(worker: WorkerRecord): TransitionResult {
    if (!worker.trustResolved) {
      return {
        worker: {
          ...worker,
          status: WorkerStatus.TRUST_REQUIRED,
          updatedAt: new Date().toISOString(),
        },
        events: [this.event(WorkerEventKind.TRUST_REQUIRED)],
      };
    }

    if (!worker.toolPermissionGranted) {
      return {
        worker: {
          ...worker,
          status: WorkerStatus.TOOL_PERMISSION_REQUIRED,
          updatedAt: new Date().toISOString(),
        },
        events: [this.event(WorkerEventKind.TOOL_PERMISSION_REQUIRED)],
      };
    }

    return {
      worker: {
        ...worker,
        status: WorkerStatus.READY_FOR_PROMPT,
        updatedAt: new Date().toISOString(),
      },
      events: [this.event(WorkerEventKind.READY_FOR_PROMPT)],
    };
  }

  sendPrompt(worker: WorkerRecord, prompt: string): TransitionResult {
    const updated: WorkerRecord = {
      ...worker,
      status: WorkerStatus.PROMPT_IN_FLIGHT,
      currentPrompt: prompt,
      updatedAt: new Date().toISOString(),
    };

    return {
      worker: updated,
      events: [this.event(WorkerEventKind.PROMPT_SENT, { prompt })],
    };
  }

  observeCompletion(
    worker: WorkerRecord,
    screenText: string,
  ): TransitionResult {
    const updated: WorkerRecord = {
      ...worker,
      updatedAt: new Date().toISOString(),
    };

    if (/provider[_\s-]?(error|failure)/i.test(screenText)) {
      updated.status = WorkerStatus.PROVIDER_FAILURE;
      updated.failureKind = WorkerFailureKind.PROVIDER_FAILURE;
      updated.completionSummary = screenText;
      return {
        worker: updated,
        events: [this.event(WorkerEventKind.PROVIDER_FAILURE, { screenText })],
      };
    }

    updated.status = WorkerStatus.COMPLETED;
    updated.failureKind = undefined;
    updated.completionSummary = screenText;
    return {
      worker: updated,
      events: [this.event(WorkerEventKind.COMPLETED, { screenText })],
    };
  }

  observeStartupTimeout(
    worker: WorkerRecord,
    evidence: Record<string, unknown>,
  ): TransitionResult {
    const updated: WorkerRecord = {
      ...worker,
      status: WorkerStatus.STARTUP_TIMEOUT,
      failureKind: WorkerFailureKind.STARTUP_TIMEOUT,
      updatedAt: new Date().toISOString(),
    };

    return {
      worker: updated,
      events: [this.event(WorkerEventKind.STARTUP_TIMEOUT, evidence)],
    };
  }

  private event(
    kind: WorkerEventKind,
    details?: Record<string, unknown>,
  ): WorkerEvent {
    return {
      kind,
      details,
      createdAt: new Date().toISOString(),
    };
  }
}
