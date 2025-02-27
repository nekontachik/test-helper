import type { TestCasePriority } from '@/types';

/**
 * Type guard to check if a string is a valid TestCasePriority
 * @param priority - The priority string to validate
 * @returns Boolean indicating if the string is a valid TestCasePriority
 */
export function isValidTestCasePriority(priority: string): priority is TestCasePriority {
  const validPriorities: TestCasePriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  return validPriorities.includes(priority as TestCasePriority);
} 