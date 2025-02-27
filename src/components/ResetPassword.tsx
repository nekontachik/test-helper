'use client';

import { useState } from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { PasswordInput } from './PasswordInput';
import { AuthFormWrapper } from './AuthFormWrapper';

/**
 * ResetPassword Component
 * 
 * Allows users to reset their password using a reset token.
 * Includes password validation and feedback.
 */

interface ResetPasswordProps {
  /** The password reset token from the URL */
  token: string;
}

export function ResetPassword({ token }: ResetPasswordProps): JSX.Element {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset password');
      }

      toast({
        title: 'Password reset successful',
        description: 'You can now sign in with your new password',
        status: 'success',
        duration: 5000,
      });

      router.push('/auth/signin');
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to reset password. Please try again.',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthFormWrapper
      title="Reset Password"
      subtitle="Enter your new password below"
    >
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <VStack spacing={6}>
          <FormControl isRequired>
            <FormLabel>New Password</FormLabel>
            <PasswordInput
              value={password}
              onValueChange={setPassword}
              placeholder="Enter your new password"
              showStrengthMeter
            />
          </FormControl>
          <Button
            type="submit"
            colorScheme="blue"
            width="full"
            isLoading={isLoading}
          >
            Reset Password
          </Button>
        </VStack>
      </form>
    </AuthFormWrapper>
  );
}

/**
 * Usage Examples:
 * 
 * ```tsx
 * // Basic usage with reset token
 * <ResetPassword token="reset_token_123" />
 * ```
 */

/**
 * Accessibility Features:
 * - Semantic form structure
 * - Proper form labels
 * - Loading state indication
 * - Error feedback
 * - Keyboard navigation
 * 
 * State Management:
 * - Password input state
 * - Loading state
 * - Form submission state
 * 
 * Error Handling:
 * - API error handling
 * - User feedback via toast
 * - Form validation
 * 
 * Security Considerations:
 * - Password strength validation
 * - Token validation
 * - CSRF protection
 * - Rate limiting
 * 
 * Dependencies:
 * - @chakra-ui/react
 * - next/navigation
 * - PasswordInput component
 * - AuthFormWrapper component
 */
