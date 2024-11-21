import { UserRole } from '@/types/auth';

export const USER_ROLES = {
  USER: UserRole.USER,
  EDITOR: UserRole.EDITOR,
  MANAGER: UserRole.MANAGER,
  ADMIN: UserRole.ADMIN,
} as const;

export const VALID_ROLES = Object.values(USER_ROLES);

export function isValidRole(role: string): role is UserRole {
  return Object.values(UserRole).includes(role as UserRole);
}

export const DEFAULT_ROLE = USER_ROLES.USER;

// Role hierarchy for permission checks
export const ROLE_HIERARCHY = {
  [UserRole.USER]: 0,
  [UserRole.VIEWER]: 1,
  [UserRole.EDITOR]: 2,
  [UserRole.MANAGER]: 3,
  [UserRole.ADMIN]: 4,
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
  [UserRole.MANAGER]: [
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