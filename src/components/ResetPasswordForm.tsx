'use client';

import { useState } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Button,
  useToast,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { PasswordInput } from './PasswordInput';
import { AuthCard } from './AuthCard';
import { AuthMessage } from './AuthMessage';

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps): JSX.Element {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        status: 'error',
        duration: 5000,
      });
      return;
    }

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

      setIsSuccess(true);
      setTimeout(() => {
        router.push('/auth/signin');
      }, 3000);
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

  if (isSuccess) {
    return (
      <AuthCard title="Password Reset Successful">
        <AuthMessage
          status="success"
          title="Password Updated"
          message="Your password has been successfully reset. You will be redirected to the sign in page."
        />
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset Password"
      subtitle="Please enter your new password below."
    >
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <VStack spacing={6}>
          <FormControl isRequired>
            <FormLabel>New Password</FormLabel>
            <PasswordInput
              value={password}
              onValueChange={setPassword}
              placeholder="Enter your new password"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Confirm Password</FormLabel>
            <PasswordInput
              value={confirmPassword}
              onValueChange={setConfirmPassword}
              placeholder="Confirm your new password"
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
    </AuthCard>
  );
}
