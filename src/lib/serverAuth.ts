import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/config';
import type { CustomSessionUser } from '@/app/api/auth/config';
import type { Permission } from '@/types/auth';
import type { Session } from 'next-auth';

/**
 * Get the current session on the server
 * @returns The current session or null if not authenticated
 */
export async function getServerAuthSession(): Promise<Session | null> {
  return getServerSession(authOptions);
}

/**
 * Get the current user on the server
 * @returns The current user or null if not authenticated
 */
export async function getServerUser(): Promise<CustomSessionUser | null> {
  const session = await getServerSession(authOptions);
  return session?.user as CustomSessionUser | null;
}

/**
 * Check if the current user has the specified role
 * @param user The user to check
 * @param role The role to check for
 * @returns True if the user has the role, false otherwise
 */
export function hasRole(user: CustomSessionUser | null, role: string): boolean {
  if (!user) return false;
  return user.role === role;
}

/**
 * Check if the current user has the specified permission
 * @param user The user to check
 * @param permission The permission to check for
 * @returns True if the user has the permission, false otherwise
 */
export function hasPermission(user: CustomSessionUser | null, permission: Permission): boolean {
  if (!user) return false;
  return user.permissions?.includes(permission) || false;
}

/**
 * Check if the current user is authenticated
 * @param user The user to check
 * @returns True if the user is authenticated, false otherwise
 */
export function isAuthenticated(user: CustomSessionUser | null): boolean {
  return !!user;
}

/**
 * Check if the current user is an admin
 * @param user The user to check
 * @returns True if the user is an admin, false otherwise
 */
export function isAdmin(user: CustomSessionUser | null): boolean {
  if (!user) return false;
  return user.role === 'ADMIN';
} 