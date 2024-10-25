'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { UserRole } from '@/types/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: UserRole;
  } | null;
  hasPermission: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const hasPermission = (roles: UserRole[]) => {
    if (!session?.user?.role) return false;
    return roles.includes(session.user.role);
  };

  const value = {
    isAuthenticated: !!session,
    isLoading: status === 'loading',
    user: session?.user ?? null,
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
