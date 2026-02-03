import { CreateDateColumn, UpdateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Base entity with common timestamp fields
 * All entities should extend this class for consistent ID and timestamp handling
 */
export abstract class BaseEntity {
  @ApiProperty({
    description: 'Unique identifier (UUID v4)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Record creation timestamp',
    type: 'string',
    format: 'date-time',
    example: '2026-02-03T10:30:00Z'
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    type: 'string',
    format: 'date-time',
    example: '2026-02-03T10:30:00Z'
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Soft delete timestamp (null if not deleted)',
    type: 'string',
    format: 'date-time',
    nullable: true,
    example: null
  })
  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}
