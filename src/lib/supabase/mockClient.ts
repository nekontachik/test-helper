import { logger } from '@/lib/logger';
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js';

// Mock user for development
const MOCK_USER: User = {
  id: 'mock-user-id',
  app_metadata: {},
  user_metadata: {
    name: 'Test User',
    role: 'USER',
  },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'test@example.com',
  email_confirmed_at: new Date().toISOString(),
  phone: '',
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  role: '',
  updated_at: new Date().toISOString(),
};

// Admin mock user
const ADMIN_USER: User = {
  ...MOCK_USER,
  id: 'admin-user-id',
  email: 'admin@example.com',
  user_metadata: {
    name: 'Admin User',
    role: 'ADMIN',
  },
};

// Valid test credentials
const VALID_CREDENTIALS = [
  { email: 'test@example.com', password: 'password' },
  { email: 'admin@example.com', password: 'admin123' },
];

// Mock Supabase client for development
export const mockSupabase = {
  auth: {
    getSession: async () => {
      logger.debug('Mock: Getting session');
      return {
        data: {
          session: {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            expires_at: Date.now() + 3600,
            expires_in: 3600,
            token_type: 'bearer',
            user: MOCK_USER,
          }
        },
        error: null,
      };
    },
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      logger.debug('Mock: Signing in with password', { email });
      
      // Check if credentials are valid
      const isValid = VALID_CREDENTIALS.some(
        cred => cred.email === email && cred.password === password
      );
      
      if (isValid) {
        // Determine which user to return
        const user = email === 'admin@example.com' ? ADMIN_USER : MOCK_USER;
        
        return {
          data: {
            user,
            session: {
              access_token: 'mock-access-token',
              refresh_token: 'mock-refresh-token',
              expires_at: Date.now() + 3600,
              expires_in: 3600,
              token_type: 'bearer',
              user,
            }
          },
          error: null,
        };
      }
      
      // Simulate failed login
      return {
        data: { user: null, session: null },
        error: {
          message: 'Invalid login credentials',
          status: 400,
        },
      };
    },
    signUp: async ({ email }: { email: string; password: string }) => {
      logger.debug('Mock: Signing up', { email });
      
      // Simulate successful signup
      return {
        data: {
          user: {
            ...MOCK_USER,
            email,
            id: `mock-user-${Date.now()}`,
          },
          session: null,
        },
        error: null,
      };
    },
    signOut: async () => {
      logger.debug('Mock: Signing out');
      return { error: null };
    },
    onAuthStateChange: (_callback: (event: AuthChangeEvent, session: Session | null) => void) => {
      logger.debug('Mock: Setting up auth state change listener');
      // Return a mock subscription
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              logger.debug('Mock: Unsubscribing from auth state change');
            },
          },
        },
      };
    },
  },
};

// Helper function to determine if we should use the mock client
export function shouldUseMockClient(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || 
         process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co';
} 