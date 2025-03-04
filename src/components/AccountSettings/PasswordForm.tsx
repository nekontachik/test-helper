'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@chakra-ui/react';
import {
  VStack,
  Text,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
} from '@chakra-ui/react';
import logger from '@/lib/logger';
import { PasswordInputWrapper } from './PasswordInputWrapper';
import { passwordSchema } from './schemas';
import type { PasswordFormData } from './types';
import { API_ENDPOINTS, ERROR_MESSAGES } from './constants';

interface PasswordFormProps {
  isUpdating: boolean;
  setIsUpdating: (isUpdating: boolean) => void;
  onPasswordClose: () => void;
}

export function PasswordForm({ 
  isUpdating, 
  setIsUpdating,
  onPasswordClose
}: PasswordFormProps): JSX.Element {
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const handleChangePassword = async (data: PasswordFormData): Promise<void> => {
    try {
      setIsUpdating(true);
      const response = await fetch(API_ENDPOINTS.CHANGE_PASSWORD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || ERROR_MESSAGES.PASSWORD_CHANGE_FAILED);
      }

      toast({
        title: 'Password Updated',
        description: 'Your password has been successfully changed.',
        status: 'success',
        duration: 5000,
      });

      reset();
      onPasswordClose();
    } catch (error) {
      logger.error('Password change failed:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : ERROR_MESSAGES.PASSWORD_CHANGE_FAILED,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleChangePassword)}>
      <VStack spacing={6}>
        <Text fontSize="lg" fontWeight="medium">Change Password</Text>
        <FormControl isInvalid={!!errors.currentPassword}>
          <FormLabel>Current Password</FormLabel>
          <PasswordInputWrapper
            register={register}
            name="currentPassword"
            value={watch('currentPassword') || ''}
            placeholder="Enter current password"
          />
          <FormErrorMessage>
            {errors.currentPassword?.message}
          </FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.newPassword}>
          <FormLabel>New Password</FormLabel>
          <PasswordInputWrapper
            register={register}
            name="newPassword"
            value={watch('newPassword') || ''}
            placeholder="Enter new password"
          />
          <FormErrorMessage>
            {errors.newPassword?.message}
          </FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.confirmPassword}>
          <FormLabel>Confirm New Password</FormLabel>
          <PasswordInputWrapper
            register={register}
            name="confirmPassword"
            value={watch('confirmPassword') || ''}
            placeholder="Confirm new password"
          />
          <FormErrorMessage>
            {errors.confirmPassword?.message}
          </FormErrorMessage>
        </FormControl>
        <Button
          type="submit"
          colorScheme="blue"
          width="full"
          isLoading={isUpdating}
        >
          Change Password
        </Button>
      </VStack>
    </form>
  );
} 