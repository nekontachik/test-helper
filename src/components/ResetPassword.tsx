'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { PasswordInput } from './PasswordInput';
import { AuthFormWrapper } from './AuthFormWrapper';

interface ResetPasswordProps {
  token: string;
}

export function ResetPassword({ token }: ResetPasswordProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (error) {
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
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your new password"
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
