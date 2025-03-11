'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@chakra-ui/react';
import {
  VStack,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
} from '@chakra-ui/react';
import { usePermissions } from '@/hooks/usePermissions';
import { Action, Resource } from '@/lib/auth/rbac/types';
import { logger } from '@/lib/logger';
import type { AuthUser } from '@/lib/auth/types';
import { profileSchema } from './schemas';
import type { ProfileFormData } from './types';
import { API_ENDPOINTS, ERROR_MESSAGES } from './constants';

interface ProfileFormProps {
  user: AuthUser;
  isUpdating: boolean;
  setIsUpdating: (isUpdating: boolean) => void;
}

export function ProfileForm({ 
  user, 
  isUpdating, 
  setIsUpdating 
}: ProfileFormProps): JSX.Element {
  const toast = useToast();
  const { can } = usePermissions();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || '',
    },
  });

  const handleUpdateProfile = async (data: ProfileFormData): Promise<void> => {
    try {
      setIsUpdating(true);
      const canUpdate = await can(Action.UPDATE, Resource.USER);
      if (!canUpdate) {
        throw new Error(ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS);
      }

      const response = await fetch(API_ENDPOINTS.UPDATE_PROFILE, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(ERROR_MESSAGES.PROFILE_UPDATE_FAILED);
      }

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
        status: 'success',
        duration: 5000,
      });
    } catch (error) {
      logger.error('Profile update failed:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : ERROR_MESSAGES.PROFILE_UPDATE_FAILED,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleUpdateProfile)}>
      <VStack spacing={6}>
        <Text fontSize="lg" fontWeight="medium">Profile Information</Text>
        <FormControl isInvalid={!!errors.name}>
          <FormLabel>Name</FormLabel>
          <Input
            {...register('name')}
            placeholder="Enter your name"
          />
          <FormErrorMessage>
            {errors.name?.message}
          </FormErrorMessage>
        </FormControl>
        <Button
          type="submit"
          colorScheme="blue"
          width="full"
          isLoading={isUpdating}
        >
          Update Profile
        </Button>
      </VStack>
    </form>
  );
} 