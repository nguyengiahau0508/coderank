import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProblemsEntity } from "./entities/problems.entity";
import { TestcasesEntity } from "./entities/testcases.entity";
import { TagsEntity } from "./entities/tags.entity";


@Module({
    imports: [
        TypeOrmModule.forFeature([
            ProblemsEntity,
            TestcasesEntity,
            TagsEntity,
        ])
    ],
    controllers: [],
    providers: [],
    exports: []
})
export class ProblemsModule { }