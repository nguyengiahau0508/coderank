import { Module } from "@nestjs/common";
import { UserModule } from "./user/user.module";
import { RunnerModule } from "./runner/runner.module";


@Module({
    imports: [
        UserModule,
        RunnerModule,
    ],
})
export class RootModule {}