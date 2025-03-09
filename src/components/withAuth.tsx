'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import type { UserRole } from '@/types/auth';
import { Flex, Spinner } from '@chakra-ui/react';

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: UserRole[]
): React.FC<P> {
  return function ProtectedRoute(props: P): JSX.Element | null {
    const { user, isLoading, isAuthenticated } = useSupabaseAuth();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
      // Wait for auth state to be determined
      if (!isLoading) {
        if (!isAuthenticated) {
          router.push('/auth/signin');
        } else if (user && allowedRoles.length > 0) {
          // Check if user has required role
          const userRole = user.user_metadata?.role as UserRole;
          if (!userRole || !allowedRoles.includes(userRole)) {
            router.push('/unauthorized');
          }
        }
        setIsChecking(false);
      }
    }, [isLoading, isAuthenticated, user, router]);

    // Show loading state while checking auth
    if (isLoading || isChecking) {
      return (
        <Flex justify="center" align="center" height="100vh">
          <Spinner size="xl" color="blue.500" thickness="4px" />
        </Flex>
      );
    }

    // If not authenticated or not authorized, return null (will redirect in useEffect)
    if (!isAuthenticated || (allowedRoles.length > 0 && user && !allowedRoles.includes(user.user_metadata?.role as UserRole))) {
      return null;
    }

    // User is authenticated and authorized
    return <Component {...props} />;
  };
}
