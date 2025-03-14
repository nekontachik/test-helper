'use client';

import { 
  Box,
  Text,
  Button,
  Spinner,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  useColorMode,
  useToast
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { ErrorBoundary } from './ErrorBoundary';
import { memo } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AuthStatusProps {
  className?: string;
}

/**
 * AuthStatus component displays user authentication status and menu
 * @param props - Component props
 * @returns JSX.Element
 */
export const AuthStatus = memo(function AuthStatus({ className }: AuthStatusProps): JSX.Element {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const { colorMode: _colorMode } = useColorMode();
  const toast = useToast();

  // Handle sign out with proper error handling
  const handleSignOut = async (): Promise<void> => {
    try {
      await logout();
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
  const handleProfileClick = (): void => router.push('/profile');
  const handleAdminClick = (): void => router.push('/admin');
  const handleVerifyClick = (): void => router.push('/auth/verify');
  const handleSignInClick = (): void => router.push('/auth/signin');

  // Show loading state
  if (isLoading) {
    return (
      <Box display="flex" alignItems="center" className={className}>
        <Spinner size="sm" mr={2} />
        <Text>Loading...</Text>
      </Box>
    );
  }

  // Show sign in button for unauthenticated users
  if (!user) {
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
            src={user.image || ''}
            name={user.name || user.email || ''} 
            mr={2}
          />
          <Text display={{ base: 'none', md: 'block' }}>
            {user.name || user.email}
          </Text>
        </MenuButton>
        <MenuList>
          <MenuItem onClick={handleProfileClick}>
            Profile
          </MenuItem>
          {user.role === 'ADMIN' && (
            <MenuItem onClick={handleAdminClick}>
              Admin Panel
            </MenuItem>
          )}
          {!user.emailVerified && (
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
