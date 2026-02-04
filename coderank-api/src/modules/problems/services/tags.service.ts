import { Injectable } from "@nestjs/common";
import { BaseService } from "src/common/services/base.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TagsEntity } from "../entities/tags.entity";


@Injectable()
export class TagsService extends BaseService<TagsEntity>{
    constructor(
        @InjectRepository(TagsEntity) 
        protected readonly repository: Repository<TagsEntity>,
    ){super(repository)}
}