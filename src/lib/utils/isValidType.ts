import type { TestResultStatus } from '@/lib/services/report/constants';
import type { TestCasePriority } from '@/types';
import type { ApiSuccessResponse, ApiErrorResponse } from '@/types/api';
import type { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import type { ErrorResponse } from '@/lib/errors/types';
import type { NextApiResponse } from 'next';

/**
 * Type guard to check if a value is a record/object
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Helper function to check if an object has a specific property
 */
export function hasProperty<K extends string>(obj: unknown, prop: K): obj is Record<K, unknown> {
  return isRecord(obj) && prop in obj;
}

// Define constants for string literals
const NOTIFICATION_TYPES = ['info', 'success', 'warning', 'error'] as const;
type NotificationType = typeof NOTIFICATION_TYPES[number];

const TEST_STATUSES = ['PASSED', 'FAILED', 'SKIPPED', 'BLOCKED', 'PENDING', 'IN_PROGRESS'] as const;
const TEST_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

/**
 * Type guard to check if a string is a valid notification type
 */
export function isValidNotificationType(type: unknown): type is NotificationType {
  return typeof type === 'string' && 
         (NOTIFICATION_TYPES as readonly string[]).includes(type);
}

/**
 * Type guard to check if a string is a valid TestResultStatus
 */
export function isValidTestStatus(status: unknown): status is TestResultStatus {
  return typeof status === 'string' && 
         (TEST_STATUSES as readonly string[]).includes(status);
}

/**
 * Type guard to check if a string is a valid TestCasePriority
 */
export function isValidTestCasePriority(priority: unknown): priority is TestCasePriority {
  return typeof priority === 'string' && 
         (TEST_PRIORITIES as readonly string[]).includes(priority);
}

/**
 * Type guard to check if a response is an API error response
 */
export function isApiErrorResponse(response: unknown): response is ApiErrorResponse {
  if (!isRecord(response)) return false;
  if (!hasProperty(response, 'success') || !hasProperty(response, 'error')) return false;
  return response.success === false;
}

/**
 * Type guard to check if a response is an API success response
 */
export function isApiSuccessResponse<T>(response: unknown): response is ApiSuccessResponse<T> {
  if (!isRecord(response)) return false;
  if (!hasProperty(response, 'success') || !hasProperty(response, 'data')) return false;
  return response.success === true;
}

/**
 * Type guard to check if an object is an error response
 */
export function isErrorResponse(response: unknown): response is ErrorResponse {
  if (!isRecord(response)) return false;
  if (!hasProperty(response, 'error')) return false;
  
  const errorObj = response.error;
  if (!isRecord(errorObj)) return false;
  
  return hasProperty(errorObj, 'code') && hasProperty(errorObj, 'message');
}

/**
 * Type guard to check if a value is a Prisma error
 */
export function isPrismaError(error: unknown): error is PrismaClientKnownRequestError {
  if (!isRecord(error)) return false;
  if (!hasProperty(error, 'code') || !hasProperty(error, 'clientVersion')) return false;
  
  const code = error.code;
  return typeof code === 'string' && code.startsWith('P');
}

/**
 * Type guard to check if a value is an Error
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Generic type guard for checking if a value exists (not null or undefined)
 */
export function exists<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard to check if a value is an array
 */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Type guard to check if a response is a Next.js API response
 */
export function isNextApiResponse(res: unknown): res is NextApiResponse {
  if (!isRecord(res)) return false;
  return hasProperty(res, 'status') && 
         hasProperty(res, 'json') && 
         !hasProperty(res, '_getJSONData');
} 