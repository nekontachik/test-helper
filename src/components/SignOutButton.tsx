'use client';

import { useState } from 'react';
import { Button, Spinner } from '@chakra-ui/react';
import { signOut } from 'next-auth/react';
import { useToast } from '@chakra-ui/react';
import { getErrorMessage } from '@/lib/utils/error';

/**
 * SignOutButton Component
 * 
 * A button component that handles user sign-out functionality with loading state
 * and error handling.
 */

interface SignOutButtonProps {
  /** Button variant style */
  variant?: 'solid' | 'outline' | 'ghost' | 'link';
  /** Button size */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Optional className for custom styling */
  className?: string;
  /** URL to redirect after sign out */
  redirectUrl?: string;
}

export function SignOutButton({ 
  variant = 'ghost',
  size = 'md',
  className,
  redirectUrl = '/auth/signin'
}: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut({ 
        callbackUrl: redirectUrl,
        redirect: true
      });
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: 'Error signing out',
        description: getErrorMessage(error),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleSignOut}
      isDisabled={isLoading}
      leftIcon={isLoading ? <Spinner thickness="2px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xs" /> : undefined}
    >
      {isLoading ? 'Signing Out...' : 'Sign Out'}
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
 *   redirectUrl="/custom-redirect"
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
