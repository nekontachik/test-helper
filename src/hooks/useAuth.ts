import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface User {
  id: string;
  email: string;
  name?: string | undefined;
  role?: string | undefined;
}

// Define the extended session user type from NextAuth
interface ExtendedUser {
  id: string;
  email: string;
  name?: string | undefined;
  role?: string | undefined;
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
  const [error, setError] = useState<string | null>(null);
  
  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';
  
  // Map NextAuth session to our User type
  const user: User | null = session?.user ? {
    id: session.user.id as string,
    email: session.user.email as string,
    name: session.user.name,
    role: (session.user as ExtendedUser)?.role
  } : null;
  
  // Login function using NextAuth
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      
      if (result?.error) {
        setError('Invalid email or password');
        return false;
      }
      
      return true;
    } catch {
      setError('An unexpected error occurred');
      return false;
    }
  };
  
  // Logout function using NextAuth
  const logout = async (): Promise<boolean> => {
    await signOut({ redirect: false });
    router.push('/auth/login');
    return true;
  };
  
  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
  };
}
