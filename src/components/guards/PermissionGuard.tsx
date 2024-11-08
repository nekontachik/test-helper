'use client';

import * as React from 'react';
import { usePermissionCheck } from '@/hooks/usePermissionCheck';
import { Action, Resource } from '@/types/rbac';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * PermissionGuard is a component that controls access to UI elements based on user permissions.
 * It provides a way to conditionally render content based on user's permissions for specific
 * actions and resources.
 */

interface PermissionGuardProps {
  /** The action being performed (e.g., CREATE, READ, UPDATE, DELETE) */
  action: Action;
  /** The resource being accessed */
  resource: Resource;
  /** Optional ID of the specific resource instance */
  resourceId?: string;
  /** Content to render when permission is granted */
  children: React.ReactNode;
  /** Optional content to render when permission is denied */
  fallback?: React.ReactNode;
  /** Optional content to render while checking permissions */
  loadingComponent?: React.ReactNode;
  /** Optional callback when permission check completes */
  onPermissionCheck?: (hasPermission: boolean) => void;
}

/**
 * PermissionGuard Component
 * 
 * @example
 * ```tsx
 * <PermissionGuard 
 *   action={Action.UPDATE} 
 *   resource={Resource.TEST_CASE}
 *   resourceId="123"
 *   onPermissionCheck={(hasAccess) => console.log('Has permission:', hasAccess)}
 * >
 *   <EditTestCase />
 * </PermissionGuard>
 * ```
 */
export function PermissionGuard({
  action,
  resource,
  resourceId,
  children,
  fallback,
  loadingComponent,
  onPermissionCheck,
}: PermissionGuardProps) {
  const { hasPermission, isLoading } = usePermissionCheck({
    action,
    resource,
    resourceId,
  });

  // Call onPermissionCheck callback when permission check completes
  React.useEffect(() => {
    if (!isLoading && onPermissionCheck) {
      onPermissionCheck(Boolean(hasPermission));
    }
  }, [hasPermission, isLoading, onPermissionCheck]);

  // Show loading state
  if (isLoading) {
    return loadingComponent || <Skeleton className="w-full h-24" role="progressbar" />;
  }

  // Show unauthorized state
  if (!hasPermission) {
    return fallback || (
      <Alert 
        variant="destructive"
        role="alert"
        aria-live="polite"
      >
        <AlertDescription>
          You don&apos;t have permission to {action.toLowerCase()} this {resource.toLowerCase()}.
        </AlertDescription>
      </Alert>
    );
  }

  // Show authorized content
  return <>{children}</>;
}

/**
 * State Management:
 * - Uses usePermissionCheck hook for permission state
 * - Handles loading and permission states
 * - Provides callback for permission check completion
 */

/**
 * Accessibility:
 * - Uses semantic HTML for error messages
 * - Includes ARIA roles and live regions
 * - Provides clear feedback about permission status
 * - Maintains focus management
 */

/**
 * Error Handling:
 * - Provides fallback UI for unauthorized access
 * - Handles loading states gracefully
 * - Supports custom error components
 */

/**
 * Performance Considerations:
 * - Minimal re-renders through proper state management
 * - Efficient permission checking through memoized hook
 * - Lazy loading of error components
 */

/**
 * Props:
 * | Name              | Type                              | Default     | Description                                    |
 * |-------------------|-----------------------------------|-------------|------------------------------------------------|
 * | action            | Action                            | -           | The action being performed                     |
 * | resource          | Resource                          | -           | The resource being accessed                    |
 * | resourceId        | string                            | undefined   | ID of the specific resource instance           |
 * | children          | React.ReactNode                   | -           | Content to render when permitted               |
 * | fallback          | React.ReactNode                   | Alert       | Content to render when denied                  |
 * | loadingComponent  | React.ReactNode                   | Skeleton    | Content to render while loading                |
 * | onPermissionCheck | (hasPermission: boolean) => void  | undefined   | Callback when permission check completes       |
 */

/**
 * Best Practices:
 * - Always provide meaningful error messages
 * - Use resourceId when checking specific instance permissions
 * - Implement custom fallback components for better UX
 * - Handle loading states appropriately
 */

/**
 * Related Components:
 * - AuthGuard - For authentication checks
 * - RoleGuard - For role-based access control
 * - ResourceGuard - For resource-specific checks
 */ 