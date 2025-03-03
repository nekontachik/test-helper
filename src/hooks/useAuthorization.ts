import { useSession } from 'next-auth/react';
import { UserRole } from '@/types/auth';

/**
 * Custom hook to check if the current user has the required role
 * @param requiredRole The minimum role required to access a feature
 * @returns Boolean indicating if the user has the required role
 */
export const useAuthorization = (requiredRole?: UserRole): boolean => {
  const { data: session } = useSession();
  
  if (!session?.user?.role || !requiredRole) {
    return false;
  }

  const roleHierarchy: Record<UserRole, number> = {
    [UserRole.ADMIN]: 50,
    [UserRole.MANAGER]: 40,
    [UserRole.EDITOR]: 30,
    [UserRole.TESTER]: 20,
    [UserRole.VIEWER]: 10,
    [UserRole.USER]: 0
  };

  const userRoleValue = roleHierarchy[session.user.role as UserRole] || 0;
  const requiredRoleValue = roleHierarchy[requiredRole];

  return userRoleValue >= requiredRoleValue;
}; 