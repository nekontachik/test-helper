'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Spinner, Center, Text } from '@chakra-ui/react';
import { useAuthorization } from '@/hooks/useAuthorization';
import type { UserRole } from '@/types/auth';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: UserRole;
  fallback?: React.ReactNode;
}

export function RoleProtectedRoute({ 
  children, 
  requiredRole,
  fallback 
}: RoleProtectedRouteProps): JSX.Element | null {
  const { status } = useSession();
  const router = useRouter();
  const hasRequiredRole = useAuthorization(requiredRole);
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=' + encodeURIComponent(window.location.href));
    }
  }, [status, router]);
  
  if (status === 'loading') {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }
  
  if (status === 'authenticated') {
    // Check if user has the required role
    if (hasRequiredRole) {
      return <>{children}</>;
    }
    
    // User is authenticated but doesn't have the required role
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Default unauthorized message
    return (
      <Center h="100vh" flexDirection="column">
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          Access Denied
        </Text>
        <Text>
          You don&apos;t have permission to access this page.
        </Text>
      </Center>
    );
  }
  
  // Return null while redirecting
  return null;
} 