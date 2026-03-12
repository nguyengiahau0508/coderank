import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { SubmissionStatusEnum } from '../enums/enums';

export interface SubmissionCompletedSocketPayload {
  submissionId: string;
  status: SubmissionStatusEnum;
  score: number;
  passedTestcases: number;
  totalTestcases: number;
  executionTimeMs: number;
  memoryUsedMb: number;
  errorMessage?: string;
  output?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SubmissionSocket {
  private readonly authService = inject(AuthService);
  private socket: Socket | null = null;

  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    const userId = this.authService.currentUser()?.id;
    if (!userId) {
      return;
    }
1
    const wsBaseUrl = environment.apiUrl.replace(/\/api\/?$/, '');

    this.socket = io(`${wsBaseUrl}/submissions`, {
      withCredentials: true,
      query: { userId },
    });
  }

  onSubmissionCompleted(): Observable<SubmissionCompletedSocketPayload> {
    return new Observable<SubmissionCompletedSocketPayload>((subscriber) => {
      if (!this.socket) {
        subscriber.complete();
        return;
      }

      const listener = (payload: SubmissionCompletedSocketPayload) => {
        subscriber.next(payload);
      };

      this.socket.on('submission:completed', listener);

      return () => {
        this.socket?.off('submission:completed', listener);
      };
    });
  }

  disconnect(): void {
    if (!this.socket) {
      return;
    }

    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;
  }
}