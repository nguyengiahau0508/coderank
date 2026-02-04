import { Module } from "@nestjs/common";
import { UsersModule } from "./users/users.module";
import { RunnerModule } from "./runner/runner.module";
import { ProblemsModule } from "./problems/problems.module";


@Module({
    imports: [
        UsersModule,
        RunnerModule,
        ProblemsModule
    ],
})
export class RootModule {}