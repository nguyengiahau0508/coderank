import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    if (this.isIgnorableResizeObserverError(error)) {
      return;
    }

    console.error(error);
  }

  private isIgnorableResizeObserverError(error: unknown): boolean {
    const candidates: string[] = [];

    if (typeof error === 'string') {
      candidates.push(error);
    }

    if (error && typeof error === 'object') {
      const err = error as { message?: unknown; cause?: unknown };
      if (typeof err.message === 'string') {
        candidates.push(err.message);
      }
      if (err.cause && typeof err.cause === 'object') {
        const cause = err.cause as { message?: unknown };
        if (typeof cause.message === 'string') {
          candidates.push(cause.message);
        }
      }
    }

    return candidates.some((message) =>
      message.includes('ResizeObserver loop completed with undelivered notifications'),
    );
  }
}
