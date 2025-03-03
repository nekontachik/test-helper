'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/utils/clientLogger';
import type { UserRole } from '@/types/auth';

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
  login: (email: string, password: string) => Promise<boolean>;
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
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      logger.debug('Attempting login', { email });
      
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.user) {
        setUser(data.user);
        logger.debug('Login successful', { userId: data.user.id });
        return true;
      } else {
        setError(data.error || 'Login failed');
        logger.warn('Login failed', { 
          status: response.status,
          error: data.error 
        });
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      logger.error('Login error', { error: errorMessage });
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
