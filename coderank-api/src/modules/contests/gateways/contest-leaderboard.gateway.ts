import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ContestParticipantsEntity } from '../entities/contest-participants.entity';

@WebSocketGateway({
  namespace: '/contests',
})
export class ContestLeaderboardGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ContestLeaderboardGateway.name);

  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    const contestId = client.handshake.query.contestId as string | undefined;
    if (!contestId) {
      client.disconnect();
      return;
    }

    void client.join(this.getContestRoom(contestId));
    this.logger.log(`Client connected to contest ${contestId}: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Contest socket disconnected: ${client.id}`);
  }

  notifyLeaderboardUpdated(
    contestId: string,
    leaderboard: ContestParticipantsEntity[],
  ) {
    this.server
      .to(this.getContestRoom(contestId))
      .emit('contest:leaderboard-updated', {
        contestId,
        leaderboard,
      });
  }

  private getContestRoom(contestId: string): string {
    return `contest:${contestId}`;
  }
}
