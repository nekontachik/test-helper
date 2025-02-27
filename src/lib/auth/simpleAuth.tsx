'use client';

import React, { createContext, useContext } from 'react';
import type { AuthUser, Permission, UserRole, AccountStatus } from '@/types/auth';

// Define mock permissions
const MOCK_PERMISSIONS: Permission[] = [
  { id: '1', name: 'test:create', description: 'Create test cases' },
  { id: '2', name: 'test:edit', description: 'Edit test cases' },
  { id: '3', name: 'test:delete', description: 'Delete test cases' },
  { id: '4', name: 'run:execute', description: 'Execute test runs' },
];

// Define mock user with proper types
export const MOCK_USER: AuthUser = {
  id: '1',
  email: 'admin@test.com',
  name: 'Admin User',
  role: 'ADMIN' as UserRole,
  permissions: MOCK_PERMISSIONS,
  status: 'ACTIVE' as AccountStatus,
  emailNotificationsEnabled: true,
  twoFactorEnabled: false,
  twoFactorAuthenticated: false,
  emailVerified: new Date(),
};

interface AuthContextType {
  user: AuthUser;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: MOCK_USER,
  isAuthenticated: true,
});

export function SimpleAuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <AuthContext.Provider value={{ user: MOCK_USER, isAuthenticated: true }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a SimpleAuthProvider');
  }
  return context;
}; 