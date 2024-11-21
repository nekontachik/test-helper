'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signup');
      return;
    }

    router.push('/projects');
  }, [session, status, router]);

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  return null;
}
