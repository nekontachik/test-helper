import { prisma } from '@/lib/prisma';
import { AuthService } from '../authService';
import { TokenService } from '../tokens/tokenService';
import { SecurityService } from '../securityService';
import { compare } from 'bcrypt';
import { UserRole } from '@/types/auth';
import { TokenType, TokenPayload } from '@/types/token';

jest.mock('@/lib/prisma');
jest.mock('bcrypt');
jest.mock('../tokens/tokenService');
jest.mock('../securityService');

describe('AuthService', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword123',
    role: UserRole.USER,
    twoFactorEnabled: false,
    emailVerified: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateCredentials', () => {
    it('should return null for non-existent user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await AuthService.validateCredentials('test@example.com', 'password123');
      expect(result).toBeNull();
    });

    it('should return null for invalid password', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (compare as jest.Mock).mockResolvedValue(false);

      const result = await AuthService.validateCredentials('test@example.com', 'wrongpassword');
      expect(result).toBeNull();
    });

    it('should return user for valid credentials', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (compare as jest.Mock).mockResolvedValue(true);

      const result = await AuthService.validateCredentials('test@example.com', 'password123');
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        twoFactorEnabled: mockUser.twoFactorEnabled,
        emailVerified: mockUser.emailVerified,
      });
    });
  });

  describe('email verification', () => {
    it('should generate token and send email', async () => {
      const mockToken = 'mock-token-123';
      (TokenService.generateToken as jest.Mock).mockResolvedValue(mockToken);

      await AuthService.initiateEmailVerification({
        userId: mockUser.id,
        email: mockUser.email,
        name: mockUser.name
      });

      expect(TokenService.generateToken).toHaveBeenCalledWith({
        userId: mockUser.id,
        email: mockUser.email,
        type: TokenType.EMAIL_VERIFICATION
      });
    });

    it('should handle email sending failure', async () => {
      (TokenService.generateToken as jest.Mock).mockRejectedValue(new Error('Failed to send'));

      await expect(
        AuthService.initiateEmailVerification({
          userId: mockUser.id,
          email: mockUser.email,
          name: mockUser.name
        })
      ).rejects.toThrow('Failed to send');
    });

    it('should verify email with valid token', async () => {
      const mockToken = 'valid-token-123';
      const mockPayload = {
        userId: mockUser.id,
        email: mockUser.email,
        type: TokenType.EMAIL_VERIFICATION
      };

      (TokenService.validateToken as jest.Mock).mockResolvedValue(mockPayload);
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        emailVerified: new Date(),
      });

      const result = await AuthService.verifyEmail(mockToken);
      expect(result.emailVerified).toBeTruthy();
    });

    it('should handle invalid token', async () => {
      const mockToken = 'invalid-token';
      (TokenService.validateToken as jest.Mock).mockResolvedValue(null);

      await expect(AuthService.verifyEmail(mockToken))
        .rejects.toThrow('Invalid verification token');
    });
  });

  describe('password reset', () => {
    it('should not reveal user existence for non-existent email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await AuthService.initiatePasswordReset('nonexistent@example.com');
      expect(TokenService.generateToken).not.toHaveBeenCalled();
    });

    it('should generate reset token for existing user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      const mockToken = 'reset-token-123';
      (TokenService.generateToken as jest.Mock).mockResolvedValue(mockToken);

      await AuthService.initiatePasswordReset(mockUser.email);
      expect(TokenService.generateToken).toHaveBeenCalledWith({
        userId: mockUser.id,
        email: mockUser.email,
        type: TokenType.PASSWORD_RESET
      });
    });

    it('should reset password with valid token', async () => {
      const mockToken = 'valid-reset-token';
      const newPassword = 'newPassword123';
      const mockPayload = {
        userId: mockUser.id,
        email: mockUser.email,
        type: TokenType.PASSWORD_RESET
      };

      (TokenService.validateToken as jest.Mock).mockResolvedValue(mockPayload);
      (SecurityService.hashPassword as jest.Mock).mockResolvedValue('newHashedPassword');
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        password: 'newHashedPassword',
      });

      const result = await AuthService.resetPassword(mockToken, newPassword);
      expect(result).toBeDefined();
      expect(TokenService.invalidateToken).toHaveBeenCalledWith(mockToken);
    });

    it('should handle invalid reset token', async () => {
      const mockToken = 'invalid-token';
      const newPassword = 'newPassword123';
      (TokenService.validateToken as jest.Mock).mockResolvedValue(null);

      await expect(AuthService.resetPassword(mockToken, newPassword))
        .rejects.toThrow('Invalid reset token');
    });
  });
});

describe('TokenService', () => {
  it('should generate and validate tokens', async () => {
    const payload: TokenPayload = {
      userId: '1',
      email: 'test@example.com',
      type: TokenType.EMAIL_VERIFICATION
    };
    
    const token = await TokenService.generateToken(payload);
    const verified = await TokenService.validateToken(token);
    expect(verified).toMatchObject(payload);
  });

  it('should invalidate tokens', async () => {
    const payload: TokenPayload = {
      userId: '1',
      email: 'test@example.com',
      type: TokenType.PASSWORD_RESET
    };
    
    const token = await TokenService.generateToken(payload);
    await TokenService.invalidateToken(token);
    const verified = await TokenService.validateToken(token);
    expect(verified).toBeNull();
  });
}); 