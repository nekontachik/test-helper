import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import type { UserRole } from '@/types/auth';
import { useRouter } from 'next/navigation';

// Define user type to match the old AuthContext User type
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

// Define auth context state to match the old AuthContextType
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, callbackUrl?: string | null) => Promise<boolean>;
  logout: () => Promise<void>;
  error: string | null;
}

/**
 * Compatibility layer for the old useAuth hook
 * This uses useSupabaseAuth under the hood but provides the same interface as the old useAuth
 */
export function useAuth(): AuthContextType {
  const { 
    user: supabaseUser, 
    isLoading, 
    isAuthenticated,
    login: supabaseLogin,
    logout: supabaseLogout,
    error 
  } = useSupabaseAuth();
  
  const router = useRouter();

  // Convert Supabase user to the format expected by the old code
  const user = supabaseUser ? {
    id: supabaseUser.id,
    email: supabaseUser.email || null,
    name: supabaseUser.user_metadata?.name || null,
    image: supabaseUser.user_metadata?.avatar_url || null,
    role: supabaseUser.user_metadata?.role,
    twoFactorEnabled: supabaseUser.user_metadata?.twoFactorEnabled || false,
    emailVerified: supabaseUser.email_confirmed_at ? new Date(supabaseUser.email_confirmed_at) : null,
    twoFactorAuthenticated: supabaseUser.user_metadata?.twoFactorAuthenticated || false
  } : null;

  // Wrapper for login to match the old signature
  const login = async (email: string, password: string, callbackUrl?: string | null): Promise<boolean> => {
    const result = await supabaseLogin(email, password);
    
    if (result.success && callbackUrl) {
      router.push(callbackUrl);
    }
    
    return result.success;
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout: supabaseLogout,
    error
  };
}
