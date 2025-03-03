import { useAuth } from './useAuth';
import { UserRole } from '@/types/auth';
import { hasRequiredRole, hasRoleLevel } from '@/lib/auth/roles';

interface UseAuthorizationReturn {
  hasRole: (role: UserRole | UserRole[]) => boolean;
  canAccessProject: (projectId: string) => boolean;
  canManageTestRuns: boolean;
  canCreateProjects: boolean;
  canInviteUsers: boolean;
  isAdmin: boolean;
}

export function useAuthorization(): UseAuthorizationReturn {
  const { user, isAuthenticated } = useAuth();
  
  // Check if user has a specific role or any of the roles in an array
  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!isAuthenticated || !user?.role) return false;
    return hasRequiredRole(user.role as UserRole, role);
  };
  
  // Admin can do everything
  const isAdmin = hasRole('ADMIN');
  
  // Project access check
  const canAccessProject = (projectId: string): boolean => {
    if (!isAuthenticated || !user) return false;
    
    // Admins can access all projects
    if (isAdmin) return true;
    
    // In a real app, you would check if the user is a member of the project
    // This is just a placeholder implementation
    return hasRole(['MANAGER', 'EDITOR', 'TESTER']);
  };
  
  // Permission checks based on roles
  const canManageTestRuns = isAdmin || hasRole(['MANAGER', 'EDITOR']);
  const canCreateProjects = isAdmin || hasRole('MANAGER');
  const canInviteUsers = isAdmin || hasRole('MANAGER');
  
  return {
    hasRole,
    canAccessProject,
    canManageTestRuns,
    canCreateProjects,
    canInviteUsers,
    isAdmin
  };
} 