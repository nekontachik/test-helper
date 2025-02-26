import { useCallback } from 'react';
import { useSession } from 'next-auth/react';

// Define UserRole locally since it's not exported from @/types
type UserRole = 'ADMIN' | 'MANAGER' | 'TESTER' | 'VIEWER';

type Permission = 
  | 'create:project'
  | 'update:project'
  | 'delete:project'
  | 'create:testCase'
  | 'update:testCase'
  | 'delete:testCase'
  | 'create:testRun'
  | 'update:testRun'
  | 'delete:testRun'
  | 'create:report'
  | 'view:report';

const rolePermissions: Record<UserRole, Permission[]> = {
  ADMIN: [
    'create:project', 'update:project', 'delete:project',
    'create:testCase', 'update:testCase', 'delete:testCase',
    'create:testRun', 'update:testRun', 'delete:testRun',
    'create:report', 'view:report'
  ],
  MANAGER: [
    'create:project', 'update:project',
    'create:testCase', 'update:testCase', 'delete:testCase',
    'create:testRun', 'update:testRun', 'delete:testRun',
    'create:report', 'view:report'
  ],
  TESTER: [
    'update:testCase',
    'create:testRun', 'update:testRun',
    'view:report'
  ],
  VIEWER: [
    'view:report'
  ]
};

// Define role hierarchy
const roleHierarchy: Record<UserRole, UserRole[]> = {
  ADMIN: ['ADMIN'],
  MANAGER: ['ADMIN', 'MANAGER'],
  TESTER: ['ADMIN', 'MANAGER', 'TESTER'],
  VIEWER: ['ADMIN', 'MANAGER', 'TESTER', 'VIEWER']
};

export function usePermissions(): {
  can: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
} {
  const { data: session } = useSession();
  const userRole = session?.user?.role as UserRole | undefined;

  const can = useCallback((permission: Permission): boolean => {
    if (!userRole) return false;
    return rolePermissions[userRole]?.includes(permission) || false;
  }, [userRole]);

  const hasRole = useCallback((role: UserRole): boolean => {
    if (!userRole) return false;
    
    // Check if the user's role is in the required role's hierarchy
    return roleHierarchy[role].includes(userRole);
  }, [userRole]);

  return { can, hasRole };
} 