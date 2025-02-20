'use client';

import React, { createContext, useContext } from 'react';
import { AuthUser, UserRole, AccountStatus, Permission } from '@/types/auth';

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
  role: UserRole.ADMIN,
  permissions: MOCK_PERMISSIONS,
  status: AccountStatus.ACTIVE,
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

export function SimpleAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthContext.Provider value={{ user: MOCK_USER, isAuthenticated: true }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a SimpleAuthProvider');
  }
  return context;
}; 