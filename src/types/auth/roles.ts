/**
 * @file Role-related type definitions
 * 
 * Defines the role hierarchy and related types for the application's
 * role-based access control (RBAC) system.
 */

/**
 * User roles in the system, ordered by increasing permission level
 * 
 * The hierarchy is as follows:
 * - USER: Basic user with minimal permissions
 * - VIEWER: Can view resources but not modify them
 * - EDITOR: Can create and edit certain resources
 * - TESTER: Can create, edit, and execute tests
 * - PROJECT_MANAGER: Can manage projects and team members
 * - ADMIN: Has full system access
 */
export enum UserRole {
  USER = 'USER',
  VIEWER = 'VIEWER',
  EDITOR = 'EDITOR',
  TESTER = 'TESTER',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  ADMIN = 'ADMIN'
}

/**
 * Maps roles to their numeric hierarchy level
 * Higher numbers indicate more permissions
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.USER]: 10,
  [UserRole.VIEWER]: 20,
  [UserRole.EDITOR]: 30,
  [UserRole.TESTER]: 40,
  [UserRole.PROJECT_MANAGER]: 50,
  [UserRole.ADMIN]: 100,
};

/**
 * Possible account statuses
 */
export type AccountStatus = 'ACTIVE' | 'LOCKED' | 'DISABLED' | 'PENDING';

/**
 * Authentication status for client-side state management
 */
export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading';

/**
 * Role assignment context for audit purposes
 */
export interface RoleAssignment {
  userId: string;
  assignedBy: string;
  previousRole: UserRole;
  newRole: UserRole;
  reason?: string;
} 