'use client';

import {
  HStack,
  Text,
  Box,
  Badge,
} from '@chakra-ui/react';
import type { AuthUser } from '@/lib/auth/types';

interface AccountInfoProps {
  user: AuthUser;
}

export function AccountInfo({ user }: AccountInfoProps): JSX.Element {
  return (
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
  );
} 