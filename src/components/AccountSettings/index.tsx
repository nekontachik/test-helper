'use client';

import { useState } from 'react';
import { useDisclosure } from '@chakra-ui/react';
import { VStack, Divider } from '@chakra-ui/react';
import { AuthCard } from '@/components/AuthCard';
import { AccountInfo } from './AccountInfo';
import { ProfileForm } from './ProfileForm';
import { PasswordForm } from './PasswordForm';
import type { AccountSettingsProps } from './types';

export function AccountSettings({ user }: AccountSettingsProps): JSX.Element {
  const [isUpdating, setIsUpdating] = useState(false);
  const { isOpen: _isChangingPassword, onOpen: _onPasswordChange, onClose: onPasswordClose } = useDisclosure();

  return (
    <AuthCard title="Account Settings">
      <VStack spacing={8} width="100%" align="stretch">
        <AccountInfo user={user} />
        
        <Divider />
        
        <ProfileForm 
          user={user} 
          isUpdating={isUpdating} 
          setIsUpdating={setIsUpdating} 
        />
        
        <Divider />
        
        <PasswordForm 
          isUpdating={isUpdating} 
          setIsUpdating={setIsUpdating} 
          onPasswordClose={onPasswordClose} 
        />
      </VStack>
    </AuthCard>
  );
}

// Re-export all components for convenience
export * from './AccountInfo';
export * from './ProfileForm';
export * from './PasswordForm';
export * from './PasswordInputWrapper';
export * from './types';
export * from './constants';
export * from './schemas'; 