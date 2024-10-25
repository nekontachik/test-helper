'use client';

import { 
  Box, 
  HStack, 
  Avatar, 
  Text, 
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { SignOutButton } from './SignOutButton';

export function AuthStatus() {
  const { data: session } = useSession();
  const router = useRouter();
  const bgColor = useColorModeValue('white', 'gray.800');

  if (!session?.user) {
    return null;
  }

  return (
    <HStack spacing={4} justify="flex-end">
      <Menu>
        <MenuButton
          as={Button}
          variant="ghost"
          rightIcon={<ChevronDownIcon />}
        >
          <HStack spacing={3}>
            <Avatar 
              size="sm" 
              name={session.user.name || undefined}
              src={session.user.image || undefined}
            />
            <Box textAlign="left">
              <Text fontWeight="medium" fontSize="sm">
                {session.user.name}
              </Text>
              <Text fontSize="xs" color="gray.600">
                {session.user.role}
              </Text>
            </Box>
          </HStack>
        </MenuButton>
        <MenuList bg={bgColor}>
          <MenuItem onClick={() => router.push('/account/settings')}>
            Account Settings
          </MenuItem>
          <MenuItem onClick={() => router.push('/account/security')}>
            Security Settings
          </MenuItem>
          <MenuItem as={SignOutButton} />
        </MenuList>
      </Menu>
    </HStack>
  );
}
