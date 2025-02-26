'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@chakra-ui/react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  VStack,
  HStack,
  Text,
  Box,
  Badge,
  Input,
  Button,
  useDisclosure,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Divider,
} from '@chakra-ui/react';
import { AuthCard } from './AuthCard';
import { PasswordInput } from './PasswordInput';
import { usePermissions } from '@/hooks/usePermissions';
import { Action, Resource } from '@/lib/auth/rbac/types';
import logger from '@/lib/logger';
import type { AuthUser } from '@/lib/auth/types';
import type { ChangeEvent } from 'react';
import type { UseFormRegister } from 'react-hook-form';

// Validation schemas
const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(8, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

interface AccountSettingsProps {
  user: AuthUser;
}

interface PasswordInputWrapperProps {
  register: UseFormRegister<PasswordFormData>;
  name: keyof PasswordFormData;
  placeholder: string;
  value: string;
}

function PasswordInputWrapper({ register, name, placeholder, value }: PasswordInputWrapperProps): JSX.Element {
  const { onChange, ...rest } = register(name);
  
  return (
    <PasswordInput
      {...rest}
      onValueChange={(newValue) => {
        const syntheticEvent = {
          target: { value: newValue, name }
        } as unknown as ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }}
      value={value}
      placeholder={placeholder}
    />
  );
}

export function AccountSettings({ user }: AccountSettingsProps): JSX.Element {
  const [isUpdating, setIsUpdating] = useState(false);
  const toast = useToast();
  const { can } = usePermissions();
  const { isOpen: _isChangingPassword, onOpen: _onPasswordChange, onClose: onPasswordClose } = useDisclosure();

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    watch,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const handleUpdateProfile = async (data: ProfileFormData): Promise<void> => {
    try {
      setIsUpdating(true);
      const canUpdate = await can(Action.UPDATE, Resource.USER);
      if (!canUpdate) {
        throw new Error('Insufficient permissions');
      }

      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
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
        description: error instanceof Error ? error.message : 'Failed to update profile',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (data: PasswordFormData): Promise<void> => {
    try {
      setIsUpdating(true);
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to change password');
      }

      toast({
        title: 'Password Updated',
        description: 'Your password has been successfully changed.',
        status: 'success',
        duration: 5000,
      });

      resetPassword();
      onPasswordClose();
    } catch (error) {
      logger.error('Password change failed:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to change password',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <AuthCard title="Account Settings">
      <VStack spacing={8} width="100%" align="stretch">
        <Box>
          <HStack spacing={4} mb={4}>
            <Text fontSize="lg" fontWeight="medium">Account Information</Text>
            <Badge colorScheme="blue">{user.role}</Badge>
            {user.twoFactorEnabled && (
              <Badge colorScheme="green">2FA Enabled</Badge>
            )}
          </HStack>
          <Text color="gray.600" mb={4}>
            Email: {user.email}
            {user.emailVerified && (
              <Badge ml={2} colorScheme="green">Verified</Badge>
            )}
          </Text>
        </Box>

        <Divider />

        <form onSubmit={handleProfileSubmit(handleUpdateProfile)}>
          <VStack spacing={6}>
            <Text fontSize="lg" fontWeight="medium">Profile Information</Text>
            <FormControl isInvalid={!!profileErrors.name}>
              <FormLabel>Name</FormLabel>
              <Input
                {...registerProfile('name')}
                placeholder="Enter your name"
              />
              <FormErrorMessage>
                {profileErrors.name?.message}
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

        <Divider />

        <form onSubmit={handlePasswordSubmit(handleChangePassword)}>
          <VStack spacing={6}>
            <Text fontSize="lg" fontWeight="medium">Change Password</Text>
            <FormControl isInvalid={!!passwordErrors.currentPassword}>
              <FormLabel>Current Password</FormLabel>
              <PasswordInputWrapper
                register={registerPassword}
                name="currentPassword"
                value={watch('currentPassword') || ''}
                placeholder="Enter current password"
              />
              <FormErrorMessage>
                {passwordErrors.currentPassword?.message}
              </FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!passwordErrors.newPassword}>
              <FormLabel>New Password</FormLabel>
              <PasswordInputWrapper
                register={registerPassword}
                name="newPassword"
                value={watch('newPassword') || ''}
                placeholder="Enter new password"
              />
              <FormErrorMessage>
                {passwordErrors.newPassword?.message}
              </FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!passwordErrors.confirmPassword}>
              <FormLabel>Confirm New Password</FormLabel>
              <PasswordInputWrapper
                register={registerPassword}
                name="confirmPassword"
                value={watch('confirmPassword') || ''}
                placeholder="Confirm new password"
              />
              <FormErrorMessage>
                {passwordErrors.confirmPassword?.message}
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
      </VStack>
    </AuthCard>
  );
}
