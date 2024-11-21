'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { UserRole } from '@/types/auth';
import type { Session } from 'next-auth';

interface ExtendedSession extends Session {
  user: {
    id: string;
    email: string | null;
    name: string | null;
    image: string | null;
    role: UserRole;
    twoFactorEnabled: boolean;
    emailVerified: Date | null;
    twoFactorAuthenticated: boolean;
  };
}

interface AuthUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
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
    return roles.includes(session.user.role);
  };

  const user: AuthUser | null = session?.user ? {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    role: session.user.role,
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
