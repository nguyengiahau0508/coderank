import { Global, Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { GoogleStrategy } from "./strategies/google.strategy";
import { GoogleConfigModule } from "src/config/integrations/google/google-config.module";


@Global()
@Module({
    imports: [
        GoogleConfigModule
    ],
    controllers: [AuthController],
    providers: [
        GoogleStrategy
    ],
    exports: [],
})
export class AuthModule {}