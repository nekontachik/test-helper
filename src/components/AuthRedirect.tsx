'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { AuthLoading } from './AuthLoading';

interface AuthRedirectProps {
  redirectTo: string;
  redirectIfFound?: boolean;
}

export function AuthRedirect({ 
  redirectTo, 
  redirectIfFound = false 
}: AuthRedirectProps): JSX.Element {
  const { user, isLoading } = useSupabaseAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (
      (redirectIfFound && user) ||
      (!redirectIfFound && !user)
    ) {
      router.push(redirectTo);
    }
  }, [user, isLoading, redirectTo, redirectIfFound, router]);

  return <AuthLoading message="Redirecting..." />;
}
