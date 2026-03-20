import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { AppConfigService } from 'src/config/app/app-config.service';

export class SocketIoAdapter extends IoAdapter {
  private readonly appConfig: AppConfigService;

  constructor(app: INestApplicationContext) {
    super(app);
    this.appConfig = app.get(AppConfigService);
  }

  createIOServer(port: number, options?: Partial<ServerOptions>): any {
    const corsOptions: Partial<ServerOptions> = {
      ...options,
      cors: {
        origin: [this.appConfig.client_url, this.appConfig.agent_url],
        credentials: true,
      },
    };
    return super.createIOServer(port, corsOptions);
  }
}
