'use client';

import { useSession } from 'next-auth/react';
import { AuthLayout } from '@/components/AuthLayout';
import { AccountSettings } from '@/components/AccountSettings';
import { AuthMessage } from '@/components/AuthMessage';
import { useRouter } from 'next/navigation';

export default function AccountSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return null;
  }

  if (!session) {
    router.push('/auth/signin');
    return null;
  }

  return (
    <AuthLayout>
      <AccountSettings user={session.user} />
    </AuthLayout>
  );
}
