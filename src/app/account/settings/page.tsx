'use client';

import { useSession } from 'next-auth/react';
import { AuthLayout } from '@/components/AuthLayout';
import { AccountSettings } from '@/components/AccountSettings';
import { useRouter } from 'next/navigation';
import type { Session } from 'next-auth';
import { AuthUser, UserRole, AccountStatus, Permission } from '@/types/auth';

// Define a consistent user type that matches both auth and session
interface SessionUser {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  role: UserRole;
  status: AccountStatus;
  twoFactorEnabled: boolean;
  emailVerified: Date | null;
  // Additional properties
  permissions?: Permission[];
  emailNotificationsEnabled?: boolean;
  twoFactorAuthenticated?: boolean;
}

interface ExtendedSession extends Omit<Session, 'user'> {
  user: SessionUser;
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
    permissions: extendedSession.user.permissions || [],
    status: extendedSession.user.status,
    emailNotificationsEnabled: extendedSession.user.emailNotificationsEnabled || false,
    twoFactorEnabled: extendedSession.user.twoFactorEnabled,
    twoFactorAuthenticated: extendedSession.user.twoFactorAuthenticated || false,
    emailVerified: extendedSession.user.emailVerified
  };

  return (
    <AuthLayout>
      <AccountSettings user={user} />
    </AuthLayout>
  );
}
