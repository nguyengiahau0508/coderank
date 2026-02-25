import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, FindOptionsWhere, Like, Between, MoreThanOrEqual, LessThanOrEqual } from "typeorm";
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

  async getProblem(dto: PaginationQueryProblemsDto, currentUserId?: string) {
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

    const queryBuilder = this.repository.createQueryBuilder('problem');

    if (currentUserId) {
      queryBuilder.andWhere('problem.authorId = :authorId', { authorId: currentUserId });
    }

    // Join tags relation
    queryBuilder.leftJoinAndSelect('problem.tags', 'tag');

    // Difficulty filter
    if (difficulty) {
      queryBuilder.andWhere('problem.difficulty = :difficulty', { difficulty });
    }

    // Published filter
    if (isPublished !== undefined) {
      queryBuilder.andWhere('problem.isPublished = :isPublished', { isPublished });
    }

    // Points filter - Using Between, MoreThanOrEqual, LessThanOrEqual for better performance
    if (minPoints !== undefined && maxPoints !== undefined) {
      queryBuilder.andWhere('problem.points BETWEEN :minPoints AND :maxPoints', {
        minPoints,
        maxPoints,
      });
    } else if (minPoints !== undefined) {
      queryBuilder.andWhere('problem.points >= :minPoints', { minPoints });
    } else if (maxPoints !== undefined) {
      queryBuilder.andWhere('problem.points <= :maxPoints', { maxPoints });
    }

    // Search filter (title OR slug)
    if (search) {
      queryBuilder.andWhere(
        '(problem.title LIKE :search OR problem.slug LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Tag filter - Using subquery for better performance
    if (tagIds?.length) {
      queryBuilder.andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('pt.problem_id')
          .from('problem_tags', 'pt')
          .where('pt.tag_id IN (:...tagIds)')
          .getQuery();
        return `problem.id IN ${subQuery}`;
      });
      queryBuilder.setParameter('tagIds', tagIds);
    }

    // Select specific fields
    queryBuilder.select([
      'problem.id',
      'problem.title',
      'problem.slug',
      'problem.difficulty',
      'problem.points',
      'problem.isPublished',
      'problem.createdAt',
      'problem.updatedAt',
      'tag.id',
      'tag.name',
    ]);

    // Sorting
    queryBuilder.orderBy(`problem.${sortBy}`, sortOrder as 'ASC' | 'DESC');

    // Pagination
    queryBuilder.skip((page - 1) * limit).take(limit);

    // Execute query
    const [items, totalItems] = await queryBuilder.getManyAndCount();

    return {
      items,
      totalItems,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
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
