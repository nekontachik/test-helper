'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/utils/clientLogger';
import type { UserRole } from '@/types/auth';
import { sanitizeInternalUrl } from '@/lib/utils/url';
import { signIn } from 'next-auth/react';

// Define user type
export interface User {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  role?: UserRole;
  twoFactorEnabled?: boolean;
  emailVerified?: Date | null;
  twoFactorAuthenticated?: boolean;
}

// Define auth context state
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, callbackUrl?: string | null) => Promise<boolean>;
  logout: () => Promise<void>;
  error: string | null;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async (): Promise<void> => {
      try {
        setIsLoading(true);
        
        // Get current user from API
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
            logger.debug('User authenticated', { userId: data.user.id });
          } else {
            setUser(null);
            logger.debug('No authenticated user found');
          }
        } else {
          setUser(null);
          logger.debug('Failed to get session', { status: response.status });
        }
      } catch (err) {
        setUser(null);
        logger.error('Error checking authentication', { 
          error: err instanceof Error ? err.message : String(err) 
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string, callbackUrl?: string | null): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        // Only pass callbackUrl if it exists and is valid
        ...(callbackUrl && { callbackUrl: sanitizeInternalUrl(callbackUrl) })
      });

      if (result?.error) {
        setError(result.error);
        return false;
      }

      if (result?.ok) {
        // Use the safe URL for redirection
        const redirectUrl = callbackUrl ? sanitizeInternalUrl(callbackUrl) : '/dashboard';
        router.push(redirectUrl);
        router.refresh();
        return true;
      }

      return false;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred';
      setError(errorMessage);
      logger.error('Login error:', { error });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        setUser(null);
        router.push('/auth/signin');
        logger.debug('Logout successful');
      } else {
        logger.warn('Logout failed', { status: response.status });
      }
    } catch (err) {
      logger.error('Logout error', { 
        error: err instanceof Error ? err.message : String(err) 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
