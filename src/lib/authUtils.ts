'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import type { CustomSessionUser } from '@/app/api/auth/config';
import type { Permission } from '@/types/auth';

/**
 * Custom hook to get the current authenticated user
 * @returns The current user or null if not authenticated
 */
export function useCurrentUser(): CustomSessionUser | null {
  const { data: session } = useSession();
  return session?.user as CustomSessionUser | null;
}

/**
 * Sign in with credentials
 * @param email User email
 * @param password User password
 * @returns Promise with the sign in result
 */
export async function signInWithCredentials(
  email: string, 
  password: string
): Promise<ReturnType<typeof signIn>> {
  return signIn('credentials', {
    email,
    password,
    redirect: false,
  });
}

/**
 * Sign in with Google
 * @param callbackUrl URL to redirect to after successful sign in
 * @returns Promise with the sign in result
 */
export function signInWithGoogle(
  callbackUrl?: string
): ReturnType<typeof signIn> {
  return signIn('google', callbackUrl ? { callbackUrl } : undefined);
}

/**
 * Sign in with GitHub
 * @param callbackUrl URL to redirect to after successful sign in
 * @returns Promise with the sign in result
 */
export function signInWithGithub(
  callbackUrl?: string
): ReturnType<typeof signIn> {
  return signIn('github', callbackUrl ? { callbackUrl } : undefined);
}

/**
 * Sign out the current user
 * @param callbackUrl URL to redirect to after sign out
 * @returns Promise with the sign out result
 */
export function signOutUser(
  callbackUrl?: string
): ReturnType<typeof signOut> {
  return signOut(callbackUrl ? { callbackUrl } : undefined);
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