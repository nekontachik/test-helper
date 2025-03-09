'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useToast,
  Container,
  Heading,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { logger } from '@/lib/logger';

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage(): JSX.Element {
  const searchParams = useSearchParams();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const token = searchParams?.get('token') ?? null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordForm): Promise<void> => {
    if (!token) {
      toast({
        title: 'Error',
        description: 'Invalid reset token',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsLoading(true);
      logger.info('Submitting password reset');

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: data.password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reset password');
      }

      toast({
        title: 'Password reset successful',
        description: 'You can now log in with your new password',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      logger.error('Password reset failed', { error });
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reset password',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <Container maxW="lg" py={12}>
        <Box textAlign="center">
          <Heading mb={4}>Invalid Reset Link</Heading>
          <Text>This password reset link is invalid or has expired.</Text>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="lg" py={12}>
      <Box
        bg="white"
        p={8}
        borderRadius="lg"
        boxShadow="lg"
        _dark={{
          bg: 'gray.800',
        }}
      >
        <VStack spacing={6}>
          <Heading size="lg">Reset Your Password</Heading>
          <Text>Please enter your new password below.</Text>

          <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
            <VStack spacing={4} align="stretch">
              <FormControl isInvalid={!!errors.password}>
                <FormLabel>New Password</FormLabel>
                <Input
                  type="password"
                  {...register('password')}
                  placeholder="Enter your new password"
                />
                <FormErrorMessage>
                  {errors.password?.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.confirmPassword}>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  type="password"
                  {...register('confirmPassword')}
                  placeholder="Confirm your new password"
                />
                <FormErrorMessage>
                  {errors.confirmPassword?.message}
                </FormErrorMessage>
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                width="100%"
                isLoading={isLoading}
                loadingText="Resetting Password..."
              >
                Reset Password
              </Button>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Container>
  );
} 