import { Controller, Post } from "@nestjs/common";
import { ProblemsService } from "./services/problems.service";
import { Owner } from "src/auth/decorators/owner.decorator";
import { ProblemsEntity } from "./entities/problems.entity";
import { Public } from "src/auth/decorators";
import { ApiProblemsCreate } from "./decorator/problems-swagger.decorator";

@Controller("problems")
export class ProblemsController {
    constructor(
        private readonly problemsService: ProblemsService,
    ) {}

    @Post()
    @Owner(ProblemsEntity, "authorId")
    @ApiProblemsCreate()
    async createProblem() {
        return {'message': 'Create problem endpoint'};
    }
}   