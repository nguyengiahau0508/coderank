import { Global, Module } from "@nestjs/common";
import MariadbProviderModule from "./db/mariadb.provider";
import { JwtProviderModule } from "./auth/jwt.provider";
import { ThrottlerProviderModule } from "./integrations/throttler.provider";
import { BullmqProviderModule } from "./integrations/bullmq.provider";
import { EventEmitterProviderModule } from "./integrations/event-emitter.provider";


@Global()
@Module({
  imports: [
    MariadbProviderModule,
    JwtProviderModule,
    ThrottlerProviderModule,
    BullmqProviderModule,
    EventEmitterProviderModule,
  ],
  exports: [
    MariadbProviderModule,
    JwtProviderModule,
    ThrottlerProviderModule,
    BullmqProviderModule,
    EventEmitterProviderModule,
  ],
})
export class RootProviderModule { }
