'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useToast } from '@chakra-ui/react';
import { LoadingScreen } from './LoadingScreen';
import { usePermissions } from "@/hooks/usePermissions";
import type { UserRole } from "@/types/auth";
import { isPublicPage, DEFAULT_LOGIN_REDIRECT } from "@/lib/auth/redirects";
import { AUTH_ERRORS } from '@/lib/utils/error';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  loadingMessage?: string;
  silent?: boolean;
}

export function AuthGuard({ 
  children, 
  requiredRole,
  loadingMessage = "Checking authentication...",
  silent = false
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { hasPermission } = usePermissions();
  const toast = useToast();

  const showError = (message: string) => {
    if (!silent) {
      toast({
        title: 'Access Denied',
        description: message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    if (status === 'loading') return;

    try {
      const callbackUrl = searchParams?.get('callbackUrl');
      const isPublic = isPublicPage(pathname || '');

      if (status === 'unauthenticated' && !isPublic) {
        showError(AUTH_ERRORS.SESSION_REQUIRED);
        router.push(`/auth/signin?callbackUrl=${encodeURIComponent(pathname || '')}`);
        return;
      }

      if (status === 'authenticated') {
        if (isPublic) {
          router.push(callbackUrl || DEFAULT_LOGIN_REDIRECT);
          return;
        }

        if (requiredRole && !hasPermission('read', requiredRole)) {
          showError(AUTH_ERRORS.INSUFFICIENT_PERMISSIONS);
          router.push('/unauthorized');
          return;
        }
      }
    } catch (error) {
      console.error('AuthGuard error:', error);
      showError(AUTH_ERRORS.UNKNOWN);
    }
  }, [
    status,
    router,
    pathname,
    searchParams,
    requiredRole,
    hasPermission,
    silent,
    toast,
  ]);

  if (status === 'loading') {
    return <LoadingScreen message={loadingMessage} />;
  }

  if (status === 'unauthenticated' || (requiredRole && !hasPermission('read', requiredRole))) {
    return null;
  }

  return <>{children}</>;
} 