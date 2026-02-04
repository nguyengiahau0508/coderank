import { Body, Controller, Post } from "@nestjs/common";
import { ProblemsService } from "./services/problems.service";
import { Owner } from "src/auth/decorators/owner.decorator";
import { ProblemsEntity } from "./entities/problems.entity";
import { CurrentUser, Public, Roles } from "src/auth/decorators";
import { ApiProblemsCreate } from "./decorator/problems-swagger.decorator";
import { RolesEnum } from "src/common/enums/enums";
import { CreateProblemDto } from "./dto/problem/create-problem.dto";
import type { IJwtPayload } from "src/common/interfaces/jwt-payload.interface";

@Controller("problems")
export class ProblemsController {
    constructor(
        private readonly problemsService: ProblemsService,
    ) {}

    @Post()
    @Roles(RolesEnum.Admin, RolesEnum.ProblemSetter)
    @ApiProblemsCreate()
    async createProblem(@CurrentUser() currentUser: IJwtPayload, @Body() createProblemDto: CreateProblemDto) {
        //console.log('Creating problem by user:', currentUser.userId, 'with roles:', currentUser.roles);
        return this.problemsService.create({
            ...createProblemDto,
            authorId: currentUser.userId,
        });
    }
}   