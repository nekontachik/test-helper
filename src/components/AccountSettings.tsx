'use client';

import { useState } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Divider,
  Text,
  Box,
  HStack,
  Badge,
} from '@chakra-ui/react';
import { AuthCard } from './AuthCard';
import { PasswordInput } from './PasswordInput';
import type { User } from '@/types/auth';

interface AccountSettingsProps {
  user: User;
}

export function AccountSettings({ user }: AccountSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(user.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const toast = useToast();

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
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
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        status: 'error',
        duration: 5000,
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to change password');
      }

      toast({
        title: 'Password Updated',
        description: 'Your password has been successfully changed.',
        status: 'success',
        duration: 5000,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to change password. Please try again.',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard title="Account Settings">
      <VStack spacing={8} width="100%" align="stretch">
        <Box>
          <HStack spacing={4} mb={4}>
            <Text fontSize="lg" fontWeight="medium">Account Information</Text>
            <Badge colorScheme="blue">{user.role}</Badge>
          </HStack>
          <Text color="gray.600" mb={4}>
            Email: {user.email}
            {user.emailVerified && (
              <Badge ml={2} colorScheme="green">Verified</Badge>
            )}
          </Text>
        </Box>

        <Divider />

        <form onSubmit={handleUpdateProfile}>
          <VStack spacing={6}>
            <Text fontSize="lg" fontWeight="medium">Profile Information</Text>
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </FormControl>
            <Button
              type="submit"
              colorScheme="blue"
              width="full"
              isLoading={isLoading}
            >
              Update Profile
            </Button>
          </VStack>
        </form>

        <Divider />

        <form onSubmit={handleChangePassword}>
          <VStack spacing={6}>
            <Text fontSize="lg" fontWeight="medium">Change Password</Text>
            <FormControl isRequired>
              <FormLabel>Current Password</FormLabel>
              <PasswordInput
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>New Password</FormLabel>
              <PasswordInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Confirm New Password</FormLabel>
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </FormControl>
            <Button
              type="submit"
              colorScheme="blue"
              width="full"
              isLoading={isLoading}
            >
              Change Password
            </Button>
          </VStack>
        </form>
      </VStack>
    </AuthCard>
  );
}
