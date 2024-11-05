'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { UserRole } from '@/types/rbac';
import type { Session } from 'next-auth';

interface ExtendedSession extends Session {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: UserRole;
    twoFactorEnabled: boolean;
    emailVerified: Date | null;
    twoFactorAuthenticated: boolean;
  };
}

interface AuthUser {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  twoFactorEnabled?: boolean;
  emailVerified?: Date | null;
  twoFactorAuthenticated?: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  hasPermission: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession() as { data: ExtendedSession | null, status: string };

  const hasPermission = (roles: UserRole[]) => {
    if (!session?.user?.role) return false;
    return roles.includes(session.user.role as UserRole);
  };

  const user: AuthUser | null = session?.user ? {
    id: session.user.id,
    name: session.user.name ?? null,
    email: session.user.email,
    role: session.user.role as UserRole,
    twoFactorEnabled: session.user.twoFactorEnabled,
    emailVerified: session.user.emailVerified,
    twoFactorAuthenticated: session.user.twoFactorAuthenticated,
  } : null;

  const value: AuthContextType = {
    isAuthenticated: !!session,
    isLoading: status === 'loading',
    user,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
