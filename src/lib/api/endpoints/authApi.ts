import { post } from '../core/httpMethods';
import { handleApiError } from '../utils/errorHandler';

/**
 * Authentication API endpoints
 */
export const authApi = {
  /**
   * Register a new user
   */
  async register(data: { 
    name: string; 
    email: string; 
    password: string; 
    role: string 
  }): Promise<void> {
    try {
      await post<{ success: boolean }>('/auth/register', data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Log in a user
   */
  async login(credentials: { 
    email: string; 
    password: string; 
    rememberMe?: boolean 
  }): Promise<{ token: string; user: unknown }> {
    try {
      return await post<{ token: string; user: unknown }>('/auth/login', credentials);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Refresh an access token using a refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      return await post<{ accessToken: string; refreshToken: string }>(
        '/auth/refresh-token', 
        { refreshToken }
      );
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Request a password reset email
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await post('/auth/request-password-reset', { email });
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Reset a password using a token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await post('/auth/reset-password', { token, newPassword });
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Verify a user's email address
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      await post('/auth/verify-email', { token });
    } catch (error) {
      throw handleApiError(error);
    }
  }
}; 