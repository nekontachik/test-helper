import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { UserRole } from '@/types/auth';

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
  const { user } = useSupabaseAuth();
  
  // Get user role from Supabase user metadata
  // Default to USER role if not specified
  const userRole = user?.user_metadata?.role as UserRole || UserRole.USER;
  
  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user || !userRole) return false;
    
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return allowedRoles.includes(userRole);
  };

  return {
    hasRole,
    isAdmin: () => userRole === UserRole.ADMIN,
    isProjectManager: () => userRole === UserRole.PROJECT_MANAGER,
    isTester: () => userRole === UserRole.EDITOR,
    role: userRole,
  };
}
