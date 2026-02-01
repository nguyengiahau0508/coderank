import { Global, Module } from "@nestjs/common";
import MariadbProviderModule from "./db/mariadb.provider";


@Global()
@Module({
    imports: [
        MariadbProviderModule,
    ],
})
export class RootProviderModule { }