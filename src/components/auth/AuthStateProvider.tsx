'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Spinner, Center, Box } from '@chakra-ui/react';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';

// Define public paths that don't require authentication
const PUBLIC_PATHS = [
  '/auth/signin',
  '/auth/signup',
  '/auth/register',
  '/auth/reset-password',
  '/auth/verify',
];

// Define the auth state context type
interface AuthStateContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Create the context
const AuthStateContext = createContext<AuthStateContextType | undefined>(undefined);

// Hook to use the auth state context
export const useAuthState = (): AuthStateContextType => {
  const context = useContext(AuthStateContext);
  if (context === undefined) {
    throw new Error('useAuthState must be used within an AuthStateProvider');
  }
  return context;
};

interface AuthStateProviderProps {
  children: React.ReactNode;
}

export function AuthStateProvider({ children }: AuthStateProviderProps): JSX.Element {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if the current path is public
  const isPublicPath = PUBLIC_PATHS.some(path => pathname?.startsWith(path));
  
  // Get the callback URL from search params or default to dashboard
  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard';

  useEffect(() => {
    // Skip if still loading auth state
    if (authLoading) return;

    logger.debug('Auth state check', { 
      isAuthenticated, 
      isPublicPath, 
      pathname 
    });

    // Handle authentication state
    if (isAuthenticated) {
      // User is authenticated
      if (isPublicPath) {
        // If on a public path, redirect to dashboard or callback URL
        logger.debug('Redirecting authenticated user from public path', { 
          from: pathname, 
          to: callbackUrl 
        });
        router.push(callbackUrl);
      }
    } else {
      // User is not authenticated
      if (!isPublicPath) {
        // If not on a public path, redirect to signin
        const redirectUrl = `/auth/signin?callbackUrl=${encodeURIComponent(pathname || '')}`;
        logger.debug('Redirecting unauthenticated user to signin', { 
          from: pathname, 
          to: redirectUrl 
        });
        router.push(redirectUrl);
      }
    }

    // Set loading to false after handling auth state
    setIsLoading(false);
  }, [isAuthenticated, authLoading, router, pathname, isPublicPath, callbackUrl, searchParams]);

  // Provide the auth state context
  const authState: AuthStateContextType = {
    isLoading: isLoading || authLoading,
    isAuthenticated,
  };

  // Show loading spinner during initial auth check
  if (isLoading || authLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Center>
    );
  }

  // For public paths, always render children
  if (isPublicPath) {
    return (
      <AuthStateContext.Provider value={authState}>
        {children}
      </AuthStateContext.Provider>
    );
  }

  // For protected paths, only render if authenticated
  return (
    <AuthStateContext.Provider value={authState}>
      {user ? children : <Box>Redirecting to sign in...</Box>}
    </AuthStateContext.Provider>
  );
} 