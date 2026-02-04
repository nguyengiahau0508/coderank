import { CreateDateColumn, UpdateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import {
  ApiUuidProperty,
  ApiCreatedAtProperty,
  ApiUpdatedAtProperty,
  ApiDeletedAtProperty,
} from '../decorators';

/**
 * Base entity with common timestamp fields
 * All entities should extend this class for consistent ID and timestamp handling
 */
export abstract class BaseEntity {
  @ApiUuidProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiCreatedAtProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiUpdatedAtProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiDeletedAtProperty()
  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}
