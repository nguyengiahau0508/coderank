import { Global, Module } from "@nestjs/common";
import MariadbProviderModule from "./db/mariadb.provider";
import { JwtProviderModule } from "./auth/jwt.provider";
import { ThrottlerProviderModule } from "./integrations/throttler.provider";


@Global()
@Module({
    imports: [
        MariadbProviderModule,
        JwtProviderModule,
        ThrottlerProviderModule,
    ],
    exports: [
        MariadbProviderModule,
        JwtProviderModule,
        ThrottlerProviderModule,
    ],
})
export class RootProviderModule { }