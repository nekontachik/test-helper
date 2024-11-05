export const USER_ROLES = {
  USER: 'USER',
  TESTER: 'TESTER',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  ADMIN: 'ADMIN',
} as const;

export const VALID_ROLES = Object.values(USER_ROLES);

export function isValidRole(role: string): role is keyof typeof USER_ROLES {
  return VALID_ROLES.includes(role as keyof typeof USER_ROLES);
}

export const DEFAULT_ROLE = USER_ROLES.USER;

// Role hierarchy for permission checks
export const ROLE_HIERARCHY = {
  [USER_ROLES.USER]: 0,
  [USER_ROLES.TESTER]: 1,
  [USER_ROLES.PROJECT_MANAGER]: 2,
  [USER_ROLES.ADMIN]: 3,
} as const;

// Role permissions mapping
export const ROLE_PERMISSIONS = {
  [USER_ROLES.USER]: ['read:projects', 'read:testCases'],
  [USER_ROLES.TESTER]: [
    'read:projects',
    'read:testCases',
    'create:testCases',
    'update:testCases',
    'execute:testRuns'
  ],
  [USER_ROLES.PROJECT_MANAGER]: [
    'read:projects',
    'create:projects',
    'update:projects',
    'read:testCases',
    'create:testCases',
    'update:testCases',
    'delete:testCases',
    'manage:testRuns'
  ],
  [USER_ROLES.ADMIN]: ['*']
} as const; 