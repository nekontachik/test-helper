import { useSession } from 'next-auth/react';
import { UserRole } from '@/types/rbac';
import type { Session } from 'next-auth';

interface ExtendedUser {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  role: UserRole;
  twoFactorEnabled: boolean;
  twoFactorAuthenticated: boolean;
  emailVerified: Date | null;
}

interface ExtendedSession extends Session {
  user: ExtendedUser;
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
    isAdmin: () => session?.user?.role === UserRole.ADMIN,
    isProjectManager: () => session?.user?.role === UserRole.PROJECT_MANAGER,
    isTester: () => session?.user?.role === UserRole.TESTER,
    role: session?.user?.role,
  };
}
