import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DEFAULT_LOGIN_REDIRECT } from '@/lib/auth/redirects';
import type { Session } from 'next-auth';

export function useAuth(requireAuth = true): {
  session: Session | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  isLoading: boolean;
} {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (requireAuth && status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (!requireAuth && status === 'authenticated') {
      router.push(DEFAULT_LOGIN_REDIRECT);
    }
  }, [requireAuth, status, router]);

  return { session, status, isLoading: status === 'loading' };
}
