import { useSession } from 'next-auth/react';
import { UserRole } from '@/types/auth';

interface UseRoleReturn {
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  isAdmin: () => boolean;
  isProjectManager: () => boolean;
  isTester: () => boolean;
  role: UserRole | undefined;
}

export function useRole(): UseRoleReturn {
  const { data: session } = useSession();
  
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
