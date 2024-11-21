'use client';

import { useSession } from 'next-auth/react';
import { AuthLayout } from '@/components/AuthLayout';
import { AccountSettings } from '@/components/AccountSettings';
import { useRouter } from 'next/navigation';
import type { Session } from 'next-auth';
import type { AuthUser, AccountStatus, Permission } from '@/lib/auth/types';
import { UserRole } from '@/types/auth';

interface ExtendedSession extends Session {
  user: {
    id: string;
    email: string | null;
    name: string | null;
    image: string | null;
    role: UserRole;
    permissions: Permission[];
    status: AccountStatus;
    emailNotificationsEnabled: boolean;
    twoFactorEnabled: boolean;
    twoFactorAuthenticated: boolean;
    emailVerified: Date | null;
  }
}

export default function AccountSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return null;
  }

  if (!session?.user?.email) {
    router.push('/auth/signin');
    return null;
  }

  const extendedSession = session as ExtendedSession;

  const user: AuthUser = {
    id: extendedSession.user.id,
    email: extendedSession.user.email,
    name: extendedSession.user.name,
    role: extendedSession.user.role,
    permissions: extendedSession.user.permissions,
    status: extendedSession.user.status,
    emailNotificationsEnabled: extendedSession.user.emailNotificationsEnabled,
    twoFactorEnabled: extendedSession.user.twoFactorEnabled,
    twoFactorAuthenticated: extendedSession.user.twoFactorAuthenticated,
    emailVerified: extendedSession.user.emailVerified
  };

  return (
    <AuthLayout>
      <AccountSettings user={user} />
    </AuthLayout>
  );
}
