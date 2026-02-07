import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, FindOptionsWhere, Like, In } from "typeorm";
import { BaseService } from "src/common/services/base.service";
import { ProblemsEntity } from "../entities/problems.entity";
import { PaginationQueryProblemsDto } from "../dto/problem/pagination-query-problem.dto";

@Injectable()
export class ProblemsService extends BaseService<ProblemsEntity> {
  constructor(
    @InjectRepository(ProblemsEntity)
    protected readonly repository: Repository<ProblemsEntity>,
  ) {
    super(repository);
  }

  async getProblem(dto: PaginationQueryProblemsDto) {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "DESC",
      difficulty,
      tagIds,
      isPublished,
      search,
      minPoints,
      maxPoints,
    } = dto;

    const where: FindOptionsWhere<ProblemsEntity> = {};

    // difficulty filter
    if (difficulty) {
      where.difficulty = difficulty;
    }

    // published filter
    if (isPublished !== undefined) {
      where.isPublished = isPublished;
    }

    // points filter
    if (minPoints !== undefined && maxPoints !== undefined) {
      where.points = In(
        Array.from({ length: maxPoints - minPoints + 1 }, (_, i) => i + minPoints)
      );
    } else if (minPoints !== undefined) {
      where.points = In(
        Array.from({ length: 1000 - minPoints + 1 }, (_, i) => i + minPoints)
      );
    } else if (maxPoints !== undefined) {
      where.points = In(
        Array.from({ length: maxPoints + 1 }, (_, i) => i)
      );
    }

    // search (title OR description)
    const searchWhere: FindOptionsWhere<ProblemsEntity>[] = [];
    if (search) {
      searchWhere.push(
        { ...where, title: Like(`%${search}%`) },
        { ...where, description: Like(`%${search}%`) },
      );
    }

    const [items, totalItems] = await this.repository.findAndCount({
      where: search ? searchWhere : where,
      relations: {
        tags: true, // load tags relation
      },
      order: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        difficulty: true,
        points: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
        tags: {
          id: true,
          name: true
        }
      }
    });

    let filteredItems = items;
    if (tagIds?.length) {
      filteredItems = items.filter(problem =>
        problem.tags?.some(tag => tagIds.includes(tag.id))
      );
    }

    return {
      items: filteredItems,
      totalItems: filteredItems.length,
      currentPage: page,
      totalPages: Math.ceil(filteredItems.length / limit),
    };
  }

  async addTag(problemId: string, tagId: string) {
    return this.repository
      .createQueryBuilder()
      .relation(ProblemsEntity, "tags")
      .of(problemId)
      .add(tagId);
  }

  async removeTag(problemId: string, tagId: string) {
    return this.repository
      .createQueryBuilder()
      .relation(ProblemsEntity, "tags")
      .of(problemId)
      .remove(tagId);
  }
}
