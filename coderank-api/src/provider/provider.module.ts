import { Global, Module } from "@nestjs/common";
import MariadbProviderModule from "./db/mariadb.provider";
import { JwtProviderModule } from "./auth/jwt.provider";


@Global()
@Module({
    imports: [
        MariadbProviderModule,
        JwtProviderModule,
    ],
    exports: [
        MariadbProviderModule,
        JwtProviderModule,
    ],
})
export class RootProviderModule { }