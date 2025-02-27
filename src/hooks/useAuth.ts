import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthHook extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

export function useAuth(): AuthHook {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });
  
  const router = useRouter();
  
  // Token refresh function
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        return false;
      }
      
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Token refresh failed');
      }
      
      // The refresh endpoint returns accessToken, not data.accessToken
      const newToken = data.accessToken;
      
      if (newToken) {
        localStorage.setItem('authToken', newToken);
        
        // We don't need to fetch user data again since we already have it in localStorage
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        setAuthState({
          user: userData,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }, []);
  
  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async (): Promise<void> => {
      try {
        const token = localStorage.getItem('authToken');
        const sessionId = localStorage.getItem('sessionId');
        
        if (!token || !sessionId) {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
          return;
        }
        
        // Verify token and session
        const response = await fetch('/api/auth/session/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-session-id': sessionId
          }
        });
        
        const result = await response.json();
        
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Session validation failed');
        }
        
        // Since the validate endpoint doesn't return user data,
        // we need to use the user data from localStorage or the session
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        setAuthState({
          user: userData,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Auth check failed:', error);
        
        // Try to refresh the token
        const refreshed = await refreshToken();
        
        if (!refreshed) {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Authentication failed'
          });
        }
      }
    };
    
    checkAuth();
  }, [refreshToken]);
  
  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const result = await response.json();
      
      // Check if the response indicates a failed login
      if (!response.ok || result.success === false) {
        const errorMessage = result.error?.message || 'Login failed';
        console.error('Login failed:', errorMessage);
        throw new Error(errorMessage);
      }
      
      // Check if result.data exists before accessing its properties
      if (!result.data) {
        console.error('Login response missing data:', result);
        throw new Error('Invalid server response: missing data');
      }
      
      // Check if token exists
      if (!result.data.token) {
        console.error('Login response missing token:', result.data);
        throw new Error('Invalid server response: missing token');
      }
      
      // Store tokens and session info
      localStorage.setItem('authToken', result.data.token);
      localStorage.setItem('userData', JSON.stringify(result.data.user));
      
      if (result.data.refreshToken) {
        localStorage.setItem('refreshToken', result.data.refreshToken);
      }
      
      if (result.data.sessionId) {
        localStorage.setItem('sessionId', result.data.sessionId);
      } else if (result.data.session?.id) {
        // Fallback for different response format
        localStorage.setItem('sessionId', result.data.session.id);
      }
      
      // Update auth state
      setAuthState({
        user: result.data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed'
      }));
      
      return false;
    }
  };
  
  // Logout function
  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      const sessionId = localStorage.getItem('sessionId');
      
      if (token && sessionId) {
        // Call logout API if needed
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-session-id': sessionId
          }
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('sessionId');
      localStorage.removeItem('userData');
      
      // Update state
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
      
      // Redirect to login
      router.push('/auth/signin');
    }
  }, [router]);
  
  return {
    ...authState,
    login,
    logout,
    refreshToken
  };
}
