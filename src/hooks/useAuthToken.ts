import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface AuthTokenResult {
  token: string | null;
  isLoading: boolean;
  refreshToken: () => Promise<boolean>;
  logout: () => void;
}

export function useAuthToken(): AuthTokenResult {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    setToken(storedToken);
    setIsLoading(false);
  }, []);

  // Function to refresh the token
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        return false;
      }
      
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }
      
      const data = await response.json();
      
      if (data.accessToken) {
        localStorage.setItem('authToken', data.accessToken);
        setToken(data.accessToken);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }, []);

  // Function to logout
  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    setToken(null);
    router.push('/auth/signin');
  }, [router]);

  return { token, isLoading, refreshToken, logout };
} 