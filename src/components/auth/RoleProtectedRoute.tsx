'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Spinner, Box, Center, Text } from '@chakra-ui/react';
import { useAuthorization } from '@/hooks/useAuthorization';
import { UserRole } from '@/types/auth';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: UserRole | UserRole[];
  fallback?: React.ReactNode;
}

export function RoleProtectedRoute({ 
  children, 
  requiredRole,
  fallback 
}: RoleProtectedRouteProps) {
  const { status } = useSession();
  const router = useRouter();
  const { hasRole } = useAuthorization();
  
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
    if (hasRole(requiredRole)) {
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
          You don't have permission to access this page.
        </Text>
      </Center>
    );
  }
  
  // Return null while redirecting
  return null;
} 