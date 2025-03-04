import { UserRole } from '@/types/auth';
import { isValidUserRole } from '@/lib/utils/typeGuards';

export const USER_ROLES = {
  USER: UserRole.USER,
  EDITOR: UserRole.EDITOR,
  TESTER: UserRole.TESTER,
  VIEWER: UserRole.VIEWER,
  PROJECT_MANAGER: UserRole.PROJECT_MANAGER,
  ADMIN: UserRole.ADMIN,
} as const;

export const VALID_ROLES: readonly UserRole[] = Object.values(USER_ROLES);

export { isValidUserRole as isValidRole };

export const DEFAULT_ROLE: UserRole = UserRole.USER;

// Role hierarchy for permission checks
export const ROLE_HIERARCHY = {
  [UserRole.USER]: 0,
  [UserRole.VIEWER]: 1,
  [UserRole.EDITOR]: 2,
  [UserRole.TESTER]: 3,
  [UserRole.PROJECT_MANAGER]: 4,
  [UserRole.ADMIN]: 5,
} as const;

// Role permissions mapping
export const ROLE_PERMISSIONS = {
  [UserRole.USER]: ['read:projects', 'read:testCases'],
  [UserRole.VIEWER]: ['read:projects', 'read:testCases'],
  [UserRole.EDITOR]: [
    'read:projects',
    'read:testCases',
    'create:testCases',
    'update:testCases',
    'execute:testRuns'
  ],
  [UserRole.PROJECT_MANAGER]: [
    'read:projects',
    'create:projects',
    'update:projects',
    'read:testCases',
    'create:testCases',
    'update:testCases',
    'delete:testCases',
    'manage:testRuns'
  ],
  [UserRole.ADMIN]: ['*']
} as const; 