import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProblemsEntity } from "./entities/problems.entity";
import { TestcasesEntity } from "./entities/testcases.entity";
import { TagsEntity } from "./entities/tags.entity";
import { ProblemsController } from "./problems.controller";
import { ProblemsService } from "./services/problems.service";
import { TestcasesService } from "./services/testcases.service";
import { TagsService } from "./services/tags.service";


@Module({
    imports: [
        TypeOrmModule.forFeature([
            ProblemsEntity,
            TestcasesEntity,
            TagsEntity,
        ])
    ],
    controllers: [ProblemsController],
    providers: [
        ProblemsService,
        TestcasesService,
        TagsService
    ],
    exports: []
})
export class ProblemsModule { }