import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { ContestParticipantsModel } from '../domains/contests';

export interface ContestLeaderboardUpdatedPayload {
  contestId: string;
  leaderboard: ContestParticipantsModel[];
}

@Injectable({
  providedIn: 'root',
})
export class ContestLeaderboardSocket {
  private socket: Socket | null = null;
  private currentContestId: string | null = null;

  connect(contestId: string): void {
    if (this.socket?.connected && this.currentContestId === contestId) {
      return;
    }

    this.disconnect();

    const wsBaseUrl = environment.apiUrl.replace(/\/api\/?$/, '');
    this.socket = io(`${wsBaseUrl}/contests`, {
      withCredentials: true,
      query: { contestId },
    });
    this.currentContestId = contestId;
  }

  onLeaderboardUpdated(): Observable<ContestLeaderboardUpdatedPayload> {
    return new Observable<ContestLeaderboardUpdatedPayload>((subscriber) => {
      if (!this.socket) {
        subscriber.complete();
        return;
      }

      const listener = (payload: ContestLeaderboardUpdatedPayload) => {
        subscriber.next(payload);
      };

      this.socket.on('contest:leaderboard-updated', listener);

      return () => {
        this.socket?.off('contest:leaderboard-updated', listener);
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
    this.currentContestId = null;
  }
}
