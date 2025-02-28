import { useCallback } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import logger from '@/lib/utils/logger';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

// Define the extended session user type from NextAuth
interface ExtendedUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
  [key: string]: unknown;
}

interface AuthHook {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
}

export function useAuth(): AuthHook {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Map NextAuth session to our User type
  const user: User | null = session?.user ? {
    id: session.user.id as string,
    email: session.user.email as string,
    name: session.user.name || undefined,
    role: (session.user as ExtendedUser)?.role || 'user'
  } : null;
  
  // Login function using NextAuth
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      logger.debug('Attempting login with email', { email });
      
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password
      });
      
      if (result?.error) {
        logger.error('Login failed', { error: result.error });
        return false;
      }
      
      logger.debug('Login successful');
      return true;
    } catch (error) {
      logger.error('Login error', { error });
      return false;
    }
  }, []);
  
  // Logout function using NextAuth
  const logout = useCallback(async (): Promise<boolean> => {
    try {
      await signOut({ redirect: false });
      router.push('/auth/signin');
      logger.debug('Logout successful');
      return true;
    } catch (error) {
      logger.error('Logout error', { error });
      return false;
    }
  }, [router]);
  
  return {
    user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    error: null, // NextAuth handles errors internally
    login,
    logout
  };
}
