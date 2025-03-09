'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';
import type { User } from '@supabase/supabase-js';

// Define auth context state
interface SupabaseAuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  error: string | null;
}

// Create the auth context
const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

// Auth provider props
interface SupabaseAuthProviderProps {
  children: ReactNode;
}

export const SupabaseAuthProvider: React.FC<SupabaseAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if user is authenticated on mount
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | undefined;
    
    const checkAuth = async (): Promise<void> => {
      try {
        setIsLoading(true);
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          logger.debug('User authenticated', { userId: session.user.id });
        } else {
          setUser(null);
          logger.debug('No authenticated user found');
        }
        
        // Set up auth state listener
        const response = await supabase.auth.onAuthStateChange(
          (_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
              logger.debug('Auth state changed', { userId: session.user.id });
            } else {
              logger.debug('Auth state changed, no user');
            }
          }
        );
        
        subscription = response.data.subscription;
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
    
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      setError(null);

      logger.info('Attempting sign in', { 
        email,
        hasPassword: !!password
      });

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        logger.error('Sign in error', { 
          error: signInError.message,
          email 
        });
        setError(signInError.message);
        return { success: false, error: signInError.message };
      }

      if (data.user) {
        logger.info('Sign in successful', { email });
        router.push('/dashboard');
        router.refresh();
        return { success: true };
      }

      const errorMessage = 'Authentication failed';
      logger.warn('Sign in result not ok but no error provided');
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred';
      logger.error('Login error:', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      setError(null);

      logger.info('Attempting sign up', { 
        email,
        hasPassword: !!password
      });

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password
      });

      if (signUpError) {
        logger.error('Sign up error', { 
          error: signUpError.message,
          email 
        });
        setError(signUpError.message);
        return { success: false, error: signUpError.message };
      }

      if (data.user) {
        logger.info('Sign up successful', { email });
        return { success: true };
      }

      const errorMessage = 'Registration failed';
      logger.warn('Sign up result not ok but no error provided');
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred';
      logger.error('Sign up error:', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        logger.error('Logout error', { error: signOutError.message });
        setError(signOutError.message);
        return;
      }

      setUser(null);
      router.push('/auth/signin');
      logger.debug('Logout successful');
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
    signUp,
    logout,
    error,
  };

  return <SupabaseAuthContext.Provider value={value}>{children}</SupabaseAuthContext.Provider>;
};

// Custom hook to use auth context
export const useSupabaseAuth = (): SupabaseAuthContextType => {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

export default SupabaseAuthContext; 