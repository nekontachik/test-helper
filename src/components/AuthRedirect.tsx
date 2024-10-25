'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { AuthLoading } from './AuthLoading';

interface AuthRedirectProps {
  redirectTo: string;
  redirectIfFound?: boolean;
}

export function AuthRedirect({ 
  redirectTo, 
  redirectIfFound = false 
}: AuthRedirectProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (
      (redirectIfFound && session) ||
      (!redirectIfFound && !session)
    ) {
      router.push(redirectTo);
    }
  }, [session, status, redirectTo, redirectIfFound, router]);

  return <AuthLoading message="Redirecting..." />;
}
