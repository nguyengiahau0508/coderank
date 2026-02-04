import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";


@Injectable()
export class MariadbConfigService {
  constructor(private configService: ConfigService) { }

  get host(): string | undefined {
    return this.configService.get<string>('mariadbConfig.host');
  }

  get port(): number | undefined {
    return this.configService.get<number>('mariadbConfig.port');
  }

  get username(): string | undefined {
    return this.configService.get<string>('mariadbConfig.username');
  }

  get password(): string | undefined {
    return this.configService.get<string>('mariadbConfig.password');
  }

  get dbName(): string | undefined {
    return this.configService.get<string>('mariadbConfig.name')
  }
}