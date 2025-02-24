// Re-export everything from central types
export * from '@/types/auth';

export type UserRole = 'ADMIN' | 'PROJECT_MANAGER' | 'TESTER' | 'VIEWER';

// Remove the module augmentation since it's causing conflicts
export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  emailVerified: Date | null;
  twoFactorEnabled: boolean;
  twoFactorAuthenticated: boolean;
}

export interface AuthSession {
  user: AuthUser;
  expires: string;
}

// Use these types instead of module augmentation
export type { AuthUser as User, AuthSession as Session };