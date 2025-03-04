import { UserRole } from '@/types/auth';
import type { RolePermissionsMap } from './types';

/**
 * Role-based permissions
 * Maps each role to a list of permission strings in the format 'action:resource'
 */
export const ROLE_PERMISSIONS: RolePermissionsMap = {
  [UserRole.USER]: [
    'read:projects',
    'read:testCases',
  ],
  [UserRole.VIEWER]: [
    'read:projects',
    'read:testCases',
    'read:testRuns',
    'read:reports',
  ],
  [UserRole.EDITOR]: [
    'read:projects',
    'read:testCases',
    'create:testCases',
    'update:testCases',
    'read:testRuns',
    'read:reports',
  ],
  [UserRole.TESTER]: [
    'read:projects',
    'read:testCases',
    'create:testCases',
    'update:testCases',
    'execute:testRuns',
    'read:testRuns',
    'read:reports',
  ],
  [UserRole.PROJECT_MANAGER]: [
    'read:projects',
    'create:projects',
    'update:projects',
    'delete:projects',
    'read:testCases',
    'create:testCases',
    'update:testCases',
    'delete:testCases',
    'read:testRuns',
    'create:testRuns',
    'update:testRuns',
    'delete:testRuns',
    'execute:testRuns',
    'read:reports',
    'create:reports',
    'update:reports',
    'delete:reports',
  ],
  [UserRole.ADMIN]: [
    '*', // Admin has all permissions
  ],
}; 