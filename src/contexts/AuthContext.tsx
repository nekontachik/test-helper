'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';
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

      console.log('AuthContext login called with:', { 
        email, 
        passwordLength: password?.length || 0,
        hasCallbackUrl: !!callbackUrl 
      });

      // Basic sign-in without callback URL
      const signInOptions: {
        redirect: boolean;
        email: string;
        password: string;
        callbackUrl?: string;
      } = {
        redirect: false,
        email,
        password,
      };

      // Process callback URL once and reuse the sanitized version
      let safeCallbackUrl: string | undefined;
      
      // Only add callbackUrl if it's a valid string
      if (callbackUrl && typeof callbackUrl === 'string' && callbackUrl.trim()) {
        try {
          // Try to sanitize the URL first
          safeCallbackUrl = sanitizeInternalUrl(callbackUrl);
          signInOptions.callbackUrl = safeCallbackUrl;
          console.log('Using sanitized callback URL:', safeCallbackUrl);
        } catch (error) {
          // If URL sanitization fails, log the error but continue with default URL
          console.warn('Invalid callback URL, using default', { 
            callbackUrl, 
            error: error instanceof Error ? error.message : String(error) 
          });
          logger.warn('Invalid callback URL, using default', { 
            callbackUrl,
            error: error instanceof Error ? error.message : String(error)
          });
          // Don't set callbackUrl in signInOptions if sanitization fails
        }
      }

      console.log('Preparing signIn options:', {
        email,
        passwordProvided: !!password,
        passwordLength: password?.length || 0,
        callbackUrl: signInOptions.callbackUrl || 'none'
      });

      const result = await signIn('credentials', signInOptions);
      console.log('SignIn response details:', {
        hasError: !!result?.error,
        isOk: result?.ok,
        url: result?.url,
        status: result?.status
      });

      if (result?.error) {
        console.error('Sign-in error from NextAuth:', result.error);
        setError(result.error);
        return false;
      }

      if (result?.ok) {
        // Use the already sanitized URL or default to dashboard
        const redirectUrl = safeCallbackUrl || '/dashboard';
        
        console.log('Login successful, redirecting to:', redirectUrl);
        router.push(redirectUrl);
        router.refresh();
        return true;
      }

      console.warn('Sign-in result not ok but no error provided');
      setError('Authentication failed');
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred';
      console.error('Login error caught:', error);
      setError(errorMessage);
      logger.error('Login error:', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null); // Clear any previous errors
      
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
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        const errorMessage = errorData.message || `Logout failed with status: ${response.status}`;
        setError(errorMessage);
        logger.warn('Logout failed', { 
          status: response.status, 
          error: errorMessage 
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      logger.error('Logout error', { error: errorMessage });
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
