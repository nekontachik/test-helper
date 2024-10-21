import { useUser } from '@auth0/nextjs-auth0/client';
import { User } from '@/types';

export function useAuth() {
  const { user, error, isLoading } = useUser();

  return {
    user: user as User | undefined,
    isAuthenticated: !!user,
    isLoading,
    error,
  };
}
