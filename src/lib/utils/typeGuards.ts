import { UserRole } from '@/types/auth';
import type { TestResultStatus } from '@/lib/services/report/constants';
import type { TestCasePriority } from '@/types';
import type { ApiSuccessResponse, ApiErrorResponse } from '@/types/api';
import type { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

/**
 * Type guard to check if a value is an Error
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Type guard to check if a value is a valid UserRole
 */
export function isValidUserRole(role: unknown): role is UserRole {
  return typeof role === 'string' && Object.values(UserRole).includes(role as UserRole);
}

/**
 * Type guard to check if a string is a valid TestResultStatus
 */
export function isValidTestStatus(status: unknown): status is TestResultStatus {
  if (typeof status !== 'string') return false;
  const validStatuses = ['PASSED', 'FAILED', 'SKIPPED', 'BLOCKED', 'PENDING'];
  return validStatuses.includes(status);
}

/**
 * Type guard to check if a string is a valid TestCasePriority
 */
export function isValidTestCasePriority(priority: unknown): priority is TestCasePriority {
  if (typeof priority !== 'string') return false;
  const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  return validPriorities.includes(priority);
}

/**
 * Type guard to check if a response is an API error response
 */
export function isApiErrorResponse(
  response: unknown
): response is ApiErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    response.success === false &&
    'error' in response
  );
}

/**
 * Type guard to check if a response is an API success response
 */
export function isApiSuccessResponse<T>(
  response: unknown
): response is ApiSuccessResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    response.success === true &&
    'data' in response
  );
}

/**
 * Type guard to check if an object is an API error response
 */
export function isErrorResponse(response: unknown): response is ApiErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'error' in response &&
    typeof (response as ApiErrorResponse).error === 'object' &&
    'code' in (response as ApiErrorResponse).error &&
    'message' in (response as ApiErrorResponse).error
  );
}

/**
 * Type guard to check if a value is a Prisma error
 */
export function isPrismaError(error: unknown): error is PrismaClientKnownRequestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'clientVersion' in error &&
    typeof (error as PrismaClientKnownRequestError).code === 'string' &&
    (error as PrismaClientKnownRequestError).code.startsWith('P')
  );
}

/**
 * Generic type guard for checking if a value exists (not null or undefined)
 */
export function exists<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard to check if a value is a record/object
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard to check if a value is an array
 */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
} 