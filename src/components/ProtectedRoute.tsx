'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AuthLoading } from './AuthLoading';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element | null {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return <AuthLoading />;
  }

  if (!session) {
    router.push('/auth/signin');
    return null;
  }

  return <>{children}</>;
}
