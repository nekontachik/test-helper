import { randomBytes } from 'crypto';
import { promisify } from 'util';
import { logger } from '@/lib/logger';

const randomBytesAsync = promisify(randomBytes);

/**
 * Generates a cryptographically secure random token
 * @param length Length of the token in bytes (will result in twice this length in hex)
 * @returns Promise<string> The generated token
 */
export async function generateToken(length: number = 32): Promise<string> {
  try {
    const buffer = await randomBytesAsync(length);
    return buffer.toString('hex');
  } catch (error) {
    logger.error('Failed to generate token:', error);
    throw new Error('Failed to generate secure token');
  }
}

/**
 * Validates a token format
 * @param token Token to validate
 * @returns boolean Whether the token is valid
 */
export function isValidToken(token: string): boolean {
  // Token should be a hex string of the correct length
  return /^[a-f0-9]{64}$/i.test(token);
} 