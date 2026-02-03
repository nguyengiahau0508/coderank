/**
 * Helper functions for username generation
 */

/**
 * Generate a unique username from an email address
 * @param email - The email address to generate username from
 * @param options - Optional configuration
 * @returns Generated username
 */
export function generateUsernameFromEmail(
  email: string,
  options?: {
    maxLength?: number;
    addRandomSuffix?: boolean;
    randomSuffixLength?: number;
  }
): string {
  const maxLength = options?.maxLength || 20;
  const addRandomSuffix = options?.addRandomSuffix !== false;
  const randomSuffixLength = options?.randomSuffixLength || 4;

  // Extract the part before @ from email
  const baseUsername = email.split('@')[0];

  // Remove special characters and keep only alphanumeric and underscores
  let cleanUsername = baseUsername
    .replace(/[^a-zA-Z0-9_.-]/g, '')
    .replace(/\.+/g, '_')
    .replace(/-+/g, '_')
    .toLowerCase();

  // Remove leading/trailing underscores
  cleanUsername = cleanUsername.replace(/^_+|_+$/g, '');

  // Truncate to maxLength if necessary (leaving room for suffix if enabled)
  const suffixLength = addRandomSuffix ? randomSuffixLength + 1 : 0;
  const maxBaseLength = maxLength - suffixLength;
  if (cleanUsername.length > maxBaseLength) {
    cleanUsername = cleanUsername.substring(0, maxBaseLength);
  }

  // Add random suffix to ensure uniqueness
  if (addRandomSuffix) {
    const randomSuffix = generateRandomString(randomSuffixLength);
    cleanUsername = `${cleanUsername}_${randomSuffix}`;
  }

  return cleanUsername;
}

/**
 * Check if a username is valid
 * @param username - The username to validate
 * @returns true if valid, false otherwise
 */
export function isValidUsername(username: string): boolean {
  // Username should be 3-20 characters, alphanumeric, underscore, and hyphen
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * Generate a random string of specified length
 * @param length - Length of the random string
 * @returns Random string with alphanumeric characters
 */
export function generateRandomString(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a unique username by checking against existing usernames
 * @param email - The email address
 * @param existingUsernames - Array of existing usernames to avoid duplicates
 * @param options - Optional configuration
 * @returns Unique username
 */
export function generateUniqueUsername(
  email: string,
  existingUsernames: string[],
  options?: {
    maxLength?: number;
    randomSuffixLength?: number;
  }
): string {
  let username = generateUsernameFromEmail(email, {
    ...options,
    addRandomSuffix: false,
  });

  // Check if username already exists
  if (!existingUsernames.includes(username)) {
    return username;
  }

  // If exists, add random suffix until we find a unique one
  const randomSuffixLength = options?.randomSuffixLength || 4;
  const maxAttempts = 10;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const uniqueUsername = `${username}_${generateRandomString(randomSuffixLength)}`;
    if (!existingUsernames.includes(uniqueUsername)) {
      return uniqueUsername;
    }
  }

  // Fallback: use timestamp as suffix
  return `${username}_${Date.now()}`;
}
