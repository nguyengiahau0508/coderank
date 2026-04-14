import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    if (this.isIgnorableError(error)) {
      return;
    }

    console.error(error);
  }

  private isIgnorableError(error: unknown): boolean {
    const candidates = this.collectErrorStrings(error);

    return (
      this.isIgnorableResizeObserverError(candidates) ||
      this.isIgnorableMonacoCancellationError(candidates)
    );
  }

  private collectErrorStrings(error: unknown): string[] {
    const candidates: string[] = [];

    if (typeof error === 'string') {
      candidates.push(error);
    }

    if (error && typeof error === 'object') {
      const err = error as {
        message?: unknown;
        stack?: unknown;
        cause?: unknown;
      };
      if (typeof err.message === 'string') {
        candidates.push(err.message);
      }
      if (typeof err.stack === 'string') {
        candidates.push(err.stack);
      }
      if (err.cause && typeof err.cause === 'object') {
        const cause = err.cause as { message?: unknown; stack?: unknown };
        if (typeof cause.message === 'string') {
          candidates.push(cause.message);
        }
        if (typeof cause.stack === 'string') {
          candidates.push(cause.stack);
        }
      }
    }

    return candidates;
  }

  private isIgnorableResizeObserverError(candidates: string[]): boolean {
    return candidates.some((message) =>
      message.includes('ResizeObserver loop completed with undelivered notifications'),
    );
  }

  private isIgnorableMonacoCancellationError(candidates: string[]): boolean {
    const normalized = candidates.join(' ').toLowerCase();
    return normalized.includes('canceled: canceled') && normalized.includes('monaco');
  }
}
