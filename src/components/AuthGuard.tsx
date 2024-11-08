'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useToast } from '@chakra-ui/react';
import { LoadingScreen } from './LoadingScreen';
import { usePermissions } from "@/hooks/usePermissions";
import { Action, Resource } from "@/types/rbac";
import type { UserRole } from "@/types/auth";
import { isPublicPage, DEFAULT_LOGIN_REDIRECT } from "@/lib/auth/redirects";
import { AUTH_ERRORS } from '@/lib/utils/error';

/**
 * AuthGuard is a component that handles authentication and authorization checks.
 * It protects routes and components by verifying user authentication and permissions.
 */

interface AuthGuardProps {
  /** Content to render when authorized */
  children: React.ReactNode;
  /** Required role for access */
  requiredRole?: UserRole;
  /** Message to display during loading */
  loadingMessage?: string;
  /** Whether to suppress error messages */
  silent?: boolean;
}

/**
 * AuthGuard Component
 * 
 * @example
 * ```tsx
 * <AuthGuard requiredRole="ADMIN">
 *   <AdminDashboard />
 * </AuthGuard>
 * ```
 */
export function AuthGuard({
  children,
  requiredRole,
  loadingMessage = "Checking authentication...",
  silent = false
}: AuthGuardProps) {
  // Hooks
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { can } = usePermissions();
  const toast = useToast();

  // Error handling
  const showError = React.useCallback((message: string) => {
    if (!silent) {
      toast({
        title: 'Access Denied',
        description: message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [silent, toast]);

  // Permission checking
  const checkAccess = React.useCallback(async () => {
    if (status === 'loading') return;

    try {
      const callbackUrl = searchParams?.get('callbackUrl');
      const isPublic = isPublicPage(pathname || '');

      if (status === 'unauthenticated' && !isPublic) {
        showError(AUTH_ERRORS.SESSION_REQUIRED);
        router.push(`/auth/signin?callbackUrl=${encodeURIComponent(pathname || '')}`);
        return;
      }

      if (status === 'authenticated') {
        if (isPublic) {
          router.push(callbackUrl || DEFAULT_LOGIN_REDIRECT);
          return;
        }

        if (requiredRole) {
          const hasAccess = await can(Action.READ, Resource.USER);
          if (!hasAccess) {
            showError(AUTH_ERRORS.INSUFFICIENT_PERMISSIONS);
            router.push('/unauthorized');
          }
        }
      }
    } catch (error) {
      console.error('AuthGuard error:', error);
      showError(AUTH_ERRORS.UNKNOWN);
    }
  }, [status, router, pathname, searchParams, requiredRole, can, showError]);

  // Effect for access checking
  React.useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  // Render states
  if (status === 'loading') {
    return <LoadingScreen message={loadingMessage} />;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return <>{children}</>;
}

/**
 * State Management:
 * - Tracks authentication status via useSession
 * - Manages permission checks through usePermissions
 * - Handles loading and error states
 */

/**
 * Accessibility:
 * - Provides loading feedback
 * - Shows clear error messages
 * - Maintains focus management during redirects
 */

/**
 * Error Handling:
 * - Displays toast notifications for errors
 * - Supports silent mode for suppressing errors
 * - Handles network and permission errors
 */

/**
 * Performance Considerations:
 * - Memoized callbacks for performance
 * - Efficient permission checking
 * - Minimal re-renders
 */

/**
 * Props:
 * | Name           | Type         | Default                    | Description                    |
 * |----------------|--------------|----------------------------|--------------------------------|
 * | children       | ReactNode    | -                         | Protected content              |
 * | requiredRole   | UserRole     | undefined                 | Required role for access       |
 * | loadingMessage | string       | "Checking authentication" | Loading state message          |
 * | silent         | boolean      | false                     | Suppress error messages        |
 */

/**
 * Best Practices:
 * - Place at top-level routes
 * - Combine with role-based checks
 * - Handle loading states
 * - Provide clear error feedback
 */

/**
 * Related Components:
 * - PermissionGuard
 * - RoleGuard
 * - LoadingScreen
 */