'use client';

import { 
  Box,
  Text,
  Button,
  Spinner,
} from '@chakra-ui/react';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/menu';
import { Avatar } from '@chakra-ui/avatar';
import { useColorMode } from '@chakra-ui/color-mode';
import { useToast } from '@chakra-ui/toast';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types/rbac';
import { ErrorBoundary } from './ErrorBoundary';
import { memo } from 'react';

// Define session type for better type safety
interface ExtendedSession {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: UserRole;
    image?: string | null;
    emailVerified?: boolean;
    twoFactorEnabled?: boolean;
  };
}

interface AuthStatusProps {
  className?: string;
}

/**
 * AuthStatus component displays user authentication status and menu
 * @param props - Component props
 * @returns JSX.Element
 */
export const AuthStatus = memo(function AuthStatus({ className }: AuthStatusProps) {
  const { data: session, status } = useSession() as { 
    data: ExtendedSession | null, 
    status: 'loading' | 'authenticated' | 'unauthenticated' 
  };
  const router = useRouter();
  const { colorMode } = useColorMode();
  const toast = useToast();

  // Handle sign out with proper error handling
  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/auth/signin');
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: 'Error signing out',
        description: 'Please try again',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Memoize handlers to prevent unnecessary re-renders
  const handleProfileClick = () => router.push('/profile');
  const handleAdminClick = () => router.push('/admin');
  const handleVerifyClick = () => router.push('/auth/verify');
  const handleSignInClick = () => router.push('/auth/signin');

  // Show loading state
  if (status === 'loading') {
    return (
      <Box display="flex" alignItems="center" className={className}>
        <Spinner size="sm" mr={2} />
        <Text>Loading...</Text>
      </Box>
    );
  }

  // Show sign in button for unauthenticated users
  if (!session) {
    return (
      <Button 
        onClick={handleSignInClick}
        colorScheme="blue"
        variant="outline"
        className={className}
      >
        Sign In
      </Button>
    );
  }

  // Show user menu for authenticated users
  return (
    <ErrorBoundary>
      <Menu>
        <MenuButton 
          as={Button}
          variant="ghost"
          display="flex"
          alignItems="center"
          className={className}
        >
          <Avatar 
            size="sm" 
            src={session.user.image || undefined} 
            name={session.user.name || session.user.email} 
            mr={2}
          />
          <Text display={{ base: 'none', md: 'block' }}>
            {session.user.name || session.user.email}
          </Text>
        </MenuButton>
        <MenuList>
          <MenuItem onClick={handleProfileClick}>
            Profile
          </MenuItem>
          {session.user.role === UserRole.ADMIN && (
            <MenuItem onClick={handleAdminClick}>
              Admin Panel
            </MenuItem>
          )}
          {!session.user.emailVerified && (
            <MenuItem onClick={handleVerifyClick}>
              Verify Email
            </MenuItem>
          )}
          <MenuItem onClick={handleSignOut}>
            Sign Out
          </MenuItem>
        </MenuList>
      </Menu>
    </ErrorBoundary>
  );
});

AuthStatus.displayName = 'AuthStatus';
