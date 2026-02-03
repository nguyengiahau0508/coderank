import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional, ApiPropertyOptions } from '@nestjs/swagger';

/**
 * ===========================
 * COMMON / BASE ENTITY FIELDS
 * ===========================
 */

/** UUID primary key field */
export function ApiUuidProperty() {
  return ApiProperty({
    description: 'Unique identifier (UUID v4)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  });
}

/** Created timestamp field */
export function ApiCreatedAtProperty() {
  return ApiProperty({
    description: 'Record creation timestamp',
    type: 'string',
    format: 'date-time',
    example: '2026-02-03T10:30:00Z',
  });
}

/** Updated timestamp field */
export function ApiUpdatedAtProperty() {
  return ApiProperty({
    description: 'Last update timestamp',
    type: 'string',
    format: 'date-time',
    example: '2026-02-03T10:30:00Z',
  });
}

/** Soft delete timestamp field */
export function ApiDeletedAtProperty() {
  return ApiPropertyOptional({
    description: 'Soft delete timestamp (null if not deleted)',
    type: 'string',
    format: 'date-time',
    nullable: true,
    example: null,
  });
}

/** User ID foreign key field */
export function ApiUserIdProperty() {
  return ApiProperty({
    description: 'User ID associated with this record',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  });
}

/**
 * ===========================
 * DATE/TIME FIELDS
 * ===========================
 */

/** Expiration timestamp field */
export function ApiExpiresAtProperty(description = 'Expiration timestamp') {
  return ApiProperty({
    description,
    type: 'string',
    format: 'date-time',
    example: '2026-02-10T10:30:00Z',
  });
}

/** Optional timestamp field */
export function ApiTimestampOptional(description: string) {
  return ApiPropertyOptional({
    description,
    type: 'string',
    format: 'date-time',
    nullable: true,
    example: '2026-02-03T10:30:00Z',
  });
}

/** Date only field (no time) */
export function ApiDateOptional(description: string, example = '1995-06-15') {
  return ApiPropertyOptional({
    description,
    type: 'string',
    format: 'date',
    example,
    nullable: true,
  });
}

/**
 * ===========================
 * STRING FIELDS
 * ===========================
 */

/** Required string field */
export function ApiStringProperty(description: string, example: string, maxLength?: number) {
  const options: ApiPropertyOptions = { description, example };
  if (maxLength) options.maxLength = maxLength;
  return ApiProperty(options);
}

/** Optional string field */
export function ApiStringOptional(description: string, example: string, maxLength?: number) {
  const options: ApiPropertyOptions = { description, example, nullable: true };
  if (maxLength) options.maxLength = maxLength;
  return ApiPropertyOptional(options);
}

/** Email field */
export function ApiEmailProperty(writeOnly = false) {
  return ApiProperty({
    description: 'Email address',
    example: 'user@example.com',
    format: 'email',
    maxLength: 255,
    writeOnly,
  });
}

/** URL field */
export function ApiUrlOptional(description: string, example: string) {
  return ApiPropertyOptional({
    description,
    example,
    nullable: true,
  });
}

/** Write-only field (tokens, passwords, etc.) */
export function ApiWriteOnly(description: string) {
  return ApiPropertyOptional({
    description,
    writeOnly: true,
    nullable: true,
  });
}

/**
 * ===========================
 * BOOLEAN FIELDS
 * ===========================
 */

/** Boolean field with default */
export function ApiBooleanProperty(description: string, defaultValue: boolean) {
  return ApiProperty({
    description,
    type: 'boolean',
    default: defaultValue,
    example: defaultValue,
  });
}

/**
 * ===========================
 * NUMBER FIELDS
 * ===========================
 */

/** Integer field */
export function ApiIntProperty(description: string, defaultValue = 0, min = 0) {
  return ApiProperty({
    description,
    type: 'integer',
    minimum: min,
    default: defaultValue,
    example: defaultValue,
  });
}

/** Decimal/Rating field */
export function ApiDecimalProperty(description: string, min = 0, max = 100, defaultValue = 0) {
  return ApiProperty({
    description,
    type: 'number',
    minimum: min,
    maximum: max,
    default: defaultValue,
    example: defaultValue,
  });
}

/**
 * ===========================
 * ENUM FIELDS
 * ===========================
 */

/** Enum field */
export function ApiEnumProperty<T extends object>(
  description: string,
  enumType: T,
  enumName: string,
  defaultValue?: T[keyof T],
  example?: T[keyof T],
) {
  const options: ApiPropertyOptions = {
    description,
    enum: enumType,
    enumName,
  };
  if (defaultValue !== undefined) options.default = defaultValue;
  if (example !== undefined) options.example = example;
  return ApiProperty(options);
}

/** Array of enum field */
export function ApiEnumArrayProperty<T extends object>(
  description: string,
  enumType: T,
  defaultValue?: Array<T[keyof T]>,
  example?: Array<T[keyof T]>,
) {
  return ApiProperty({
    description,
    type: [String],
    enum: enumType,
    default: defaultValue,
    example,
  });
}

/**
 * ===========================
 * RELATION FIELDS
 * ===========================
 */

/** Optional relation to another entity */
export function ApiRelationOptional(description: string, typeFactory: () => any) {
  return ApiPropertyOptional({
    description,
    type: typeFactory,
  });
}

/** Optional array relation */
export function ApiRelationArrayOptional(description: string, typeFactory: () => any[]) {
  return ApiPropertyOptional({
    description,
    type: typeFactory,
  });
}
