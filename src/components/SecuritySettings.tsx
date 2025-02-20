'use client';

import { useState } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Switch,
  Button,
  Text,
  useToast,
  Box,
  HStack,
  Badge,
} from '@chakra-ui/react';
import { AuthCard } from './AuthCard';
import type { User } from '@/types/auth';
import { logger } from '@/lib/utils/logger';

interface SecuritySettingsProps {
  user: User;
}

export function SecuritySettings({ user }: SecuritySettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user.twoFactorEnabled);
  const toast = useToast();

  const handleToggle2FA = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/2fa/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to toggle 2FA');
      }

      setTwoFactorEnabled(!twoFactorEnabled);
      toast({
        title: `2FA ${twoFactorEnabled ? 'Disabled' : 'Enabled'}`,
        description: `Two-factor authentication has been ${twoFactorEnabled ? 'disabled' : 'enabled'}.`,
        status: 'success',
        duration: 5000,
      });
    } catch (err: unknown) {
      logger.error('2FA toggle failed:', err);
      toast({
        title: 'Error',
        description: 'Failed to update 2FA settings. Please try again.',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateBackupCodes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/backup-codes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to generate backup codes');
      }

      await response.json();
      
      toast({
        title: 'Backup Codes Generated',
        description: 'Please save these codes in a secure location.',
        status: 'success',
        duration: 5000,
      });
    } catch (err: unknown) {
      logger.error('Backup codes generation failed:', err);
      toast({
        title: 'Error',
        description: 'Failed to generate backup codes. Please try again.',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard title="Security Settings">
      <VStack spacing={8} width="100%" align="stretch">
        <Box>
          <HStack spacing={4} mb={4}>
            <Text fontSize="lg" fontWeight="medium">Security Status</Text>
            <Badge colorScheme={user.emailVerified ? 'green' : 'yellow'}>
              {user.emailVerified ? 'Verified' : 'Unverified'}
            </Badge>
          </HStack>
        </Box>

        <VStack spacing={6} align="stretch">
          <FormControl display="flex" alignItems="center">
            <FormLabel mb="0">
              Two-Factor Authentication
            </FormLabel>
            <Switch
              isChecked={twoFactorEnabled}
              onChange={handleToggle2FA}
              isDisabled={isLoading || !user.emailVerified}
            />
          </FormControl>

          <Text fontSize="sm" color="gray.600">
            {twoFactorEnabled
              ? 'Two-factor authentication is enabled. This adds an extra layer of security to your account.'
              : 'Enable two-factor authentication to add an extra layer of security to your account.'}
          </Text>

          {twoFactorEnabled && (
            <Button
              onClick={handleGenerateBackupCodes}
              isLoading={isLoading}
              variant="outline"
            >
              Generate Backup Codes
            </Button>
          )}
        </VStack>

        <Box>
          <Text fontSize="lg" fontWeight="medium" mb={4}>Recent Activity</Text>
          <Text fontSize="sm" color="gray.600">
            Last login: {new Date().toLocaleString()}
          </Text>
        </Box>
      </VStack>
    </AuthCard>
  );
}
