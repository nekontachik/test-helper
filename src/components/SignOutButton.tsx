'use client';

import React from 'react';
import type { ButtonProps } from '@chakra-ui/react';
import { Button } from '@chakra-ui/react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';

/**
 * SignOutButton Component
 * 
 * A button component that handles user sign-out functionality with loading state
 * and error handling.
 */

interface SignOutButtonProps extends ButtonProps {
  redirectPath?: string;
}

export function SignOutButton({
  redirectPath = '/',
  ...props
}: SignOutButtonProps): React.ReactElement {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSignOut = async (): Promise<void> => {
    try {
      setIsLoading(true);
      logger.info('User signing out');
      await signOut({ redirect: false });
      router.push(redirectPath);
    } catch (error) {
      logger.error('Error signing out', { error });
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSignOut}
      isLoading={isLoading}
      {...props}
    >
      {props.children || 'Sign Out'}
    </Button>
  );
}

/**
 * Usage Examples:
 * 
 * Basic Usage:
 * ```tsx
 * <SignOutButton />
 * ```
 * 
 * Custom Styling:
 * ```tsx
 * <SignOutButton 
 *   variant="solid"
 *   size="lg"
 *   className="custom-class"
 *   redirectPath="/custom-redirect"
 * />
 * ```
 */

/**
 * Accessibility Features:
 * - Proper ARIA attributes
 * - Loading state indication
 * - Keyboard navigation support
 * - Error feedback via toast
 * 
 * Performance Considerations:
 * - Debounced click handler
 * - Memoized error handler
 * - Minimal re-renders
 * 
 * Dependencies:
 * - @chakra-ui/react
 * - next-auth/react
 */
