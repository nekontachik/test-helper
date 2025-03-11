import { logger } from '@/lib/logger';

/**
 * Simulates an API delay
 * @param ms - Milliseconds to delay
 */
export async function simulateApiDelay(ms: number = 500): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Logs API requests with consistent formatting
 * @param message - Log message
 * @param data - Optional data to log
 */
export function logApiRequest(message: string, data?: unknown): void {
  logger.debug(`[Mock API] ${message}`, data);
} 