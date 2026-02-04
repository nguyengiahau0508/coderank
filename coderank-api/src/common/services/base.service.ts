import { Repository, FindOptionsWhere, FindManyOptions } from 'typeorm';
import { 
  IRepository, 
  IPaginationOptions, 
  IPaginatedResult 
} from '../interfaces/repository.interface';
import { BaseEntity } from '../entities/base.entity';

/**
 * Base service providing common CRUD operations
 * @template T - Entity type extending BaseEntity
 */
export abstract class BaseService<T extends BaseEntity> implements IRepository<T> {
  constructor(protected readonly repository: Repository<T>) {}

  /**
   * Find entity by ID
   * @param id - Entity ID
   * @returns Entity or null if not found
   */
  async findById(id: string): Promise<T | null> {
    return this.repository.findOne({
      where: { id } as FindOptionsWhere<T>,
    });
  }

  /**
   * Find all entities
   * @returns Array of entities
   */
  async findAll(): Promise<T[]> {
    return this.repository.find();
  }

  /**
   * Find entities with options
   * @param options - TypeORM find options
   * @returns Array of entities
   */
  async find(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }

  /**
   * Find one entity with options
   * @param options - TypeORM find options
   * @returns Entity or null
   */
  async findOne(options: FindManyOptions<T>): Promise<T | null> {
    return this.repository.findOne(options);
  }

  /**
   * Create new entity
   * @param entity - Partial entity data
   * @returns Created entity
   */
  async create(entity: Partial<T>): Promise<T> {
    const newEntity = this.repository.create(entity as any);
    const saved = await this.repository.save(newEntity);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  /**
   * Create multiple entities
   * @param entities - Array of partial entity data
   * @returns Array of created entities
   */
  async createMany(entities: Partial<T>[]): Promise<T[]> {
    const newEntities = this.repository.create(entities as any[]);
    return this.repository.save(newEntities);
  }

  /**
   * Update entity by ID
   * @param id - Entity ID
   * @param entity - Partial entity data to update
   * @returns Updated entity
   */
  async update(id: string, entity: Partial<T>): Promise<T> {
    await this.repository.update(id, entity as any);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`Entity with ID ${id} not found`);
    }
    return updated;
  }

  /**
   * Delete entity by ID (hard delete)
   * @param id - Entity ID
   * @returns True if deleted successfully
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Soft delete entity by ID
   * @param id - Entity ID
   * @returns True if soft deleted successfully
   */
  async softDelete(id: string): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Restore soft deleted entity
   * @param id - Entity ID
   * @returns True if restored successfully
   */
  async restore(id: string): Promise<boolean> {
    const result = await this.repository.restore(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Count entities
   * @param options - TypeORM find options
   * @returns Total count
   */
  async count(options?: FindManyOptions<T>): Promise<number> {
    return this.repository.count(options);
  }

  /**
   * Check if entity exists
   * @param id - Entity ID
   * @returns True if exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { id } as FindOptionsWhere<T>,
    });
    return count > 0;
  }

  /**
   * Get paginated results
   * @param options - Pagination options
   * @returns Paginated result
   */
  async paginate(options: IPaginationOptions): Promise<IPaginatedResult<T>> {
    const { page, limit, orderBy = 'createdAt', orderDirection = 'DESC' } = options;
    
    const skip = (page - 1) * limit;
    
    const [data, total] = await this.repository.findAndCount({
      take: limit,
      skip,
      order: { [orderBy]: orderDirection } as any,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Execute a transaction
   * @param callback - Function to execute within transaction
   * @returns Result of the callback
   */
  async transaction<R>(
    callback: (entityManager: any) => Promise<R>,
  ): Promise<R> {
    return this.repository.manager.transaction(callback);
  }
}
