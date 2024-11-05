import { useSession } from 'next-auth/react';
import { UserRole, UserRoles } from '@/types/rbac';
import type { Session } from 'next-auth';

interface ExtendedSession extends Session {
  user: {
    id: string;
    email: string;
    role: UserRole;
    twoFactorEnabled: boolean;
    emailVerified: Date | null;
    twoFactorAuthenticated: boolean;
  };
}

interface UseRoleReturn {
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  isAdmin: () => boolean;
  isProjectManager: () => boolean;
  isTester: () => boolean;
  role: UserRole | undefined;
}

/**
 * Hook for checking user roles and permissions
 * @returns Object with role checking functions and current role
 */
export function useRole(): UseRoleReturn {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  
  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!session?.user?.role) return false;
    
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return allowedRoles.includes(session.user.role);
  };

  return {
    hasRole,
    isAdmin: () => session?.user?.role === UserRoles.ADMIN,
    isProjectManager: () => session?.user?.role === UserRoles.PROJECT_MANAGER,
    isTester: () => session?.user?.role === UserRoles.TESTER,
    role: session?.user?.role,
  };
}
