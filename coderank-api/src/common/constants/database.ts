/**
 * Database table name constants
 */
export const DB_TABLES = {
  USERS: 'users',
  ROLES: 'roles',
  PERMISSIONS: 'permissions',
  REFRESH_TOKENS: 'refresh_tokens',
} as const;

/**
 * Common database constraints
 */
export const DB_CONSTRAINTS = {
  MAX_VARCHAR_LENGTH: 255,
  MAX_TEXT_LENGTH: 65535,
  EMAIL_MAX_LENGTH: 320,
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
} as const;
