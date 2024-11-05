import { prisma } from '@/lib/prisma';
import { AuthService } from '../authService';
import { TokenService } from '../tokens/tokenService';
import { SecurityService } from '../securityService';
import { compare } from 'bcrypt';
import { UserRole } from '@/types/auth';

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

  describe('initiateEmailVerification', () => {
    it('should generate token and send email', async () => {
      const mockToken = 'mock-token-123';
      (TokenService.createEmailVerificationToken as jest.Mock).mockResolvedValue(mockToken);

      await AuthService.initiateEmailVerification(
        mockUser.id,
        mockUser.email,
        mockUser.name
      );

      expect(TokenService.createEmailVerificationToken).toHaveBeenCalledWith(mockUser.email);
    });

    it('should handle email sending failure', async () => {
      (TokenService.createEmailVerificationToken as jest.Mock).mockRejectedValue(new Error('Failed to send'));

      await expect(
        AuthService.initiateEmailVerification(mockUser.id, mockUser.email, mockUser.name)
      ).rejects.toThrow('Failed to send');
    });
  });

  describe('verifyEmail', () => {
    const mockToken = 'valid-token-123';

    it('should verify email with valid token', async () => {
      (TokenService.verifyToken as jest.Mock).mockResolvedValue({
        email: mockUser.email,
        type: 'EMAIL_VERIFICATION',
      });
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        emailVerified: new Date(),
      });

      const result = await AuthService.verifyEmail(mockToken);
      expect(result.emailVerified).toBeTruthy();
    });

    it('should handle invalid token', async () => {
      (TokenService.verifyToken as jest.Mock).mockResolvedValue(null);

      await expect(AuthService.verifyEmail(mockToken)).rejects.toThrow('Invalid verification token');
    });
  });

  describe('initiatePasswordReset', () => {
    it('should not reveal user existence for non-existent email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await AuthService.initiatePasswordReset('nonexistent@example.com');
      expect(TokenService.createToken).not.toHaveBeenCalled();
    });

    it('should generate reset token for existing user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      const mockToken = 'reset-token-123';
      (TokenService.createToken as jest.Mock).mockResolvedValue(mockToken);

      await AuthService.initiatePasswordReset(mockUser.email);
      expect(TokenService.createToken).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    const mockToken = 'valid-reset-token';
    const newPassword = 'newPassword123';

    it('should reset password with valid token', async () => {
      (TokenService.verifyToken as jest.Mock).mockResolvedValue({
        email: mockUser.email,
        type: 'PASSWORD_RESET',
      });
      (SecurityService.hashPassword as jest.Mock).mockResolvedValue('newHashedPassword');
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        password: 'newHashedPassword',
      });

      const result = await AuthService.resetPassword(mockToken, newPassword);
      expect(result).toBeDefined();
      expect(TokenService.revokeToken).toHaveBeenCalled();
    });

    it('should handle invalid reset token', async () => {
      (TokenService.verifyToken as jest.Mock).mockResolvedValue(null);

      await expect(AuthService.resetPassword(mockToken, newPassword))
        .rejects.toThrow('Invalid reset token');
    });
  });
});

describe('TokenService', () => {
  it('should create and verify tokens', async () => {
    const payload = { email: 'test@example.com', type: TokenType.EMAIL_VERIFICATION };
    const token = await TokenService.createToken(payload);
    const verified = await TokenService.verifyToken(token, TokenType.EMAIL_VERIFICATION);
    expect(verified).toMatchObject(payload);
  });
});

describe('Token Revocation', () => {
  it('should revoke tokens', async () => {
    const token = await TokenService.createToken({
      type: TokenType.PASSWORD_RESET,
      email: 'test@example.com'
    });
    await TokenService.revokeToken(token, TokenType.PASSWORD_RESET);
    const verified = await TokenService.verifyToken(token, TokenType.PASSWORD_RESET);
    expect(verified).toBeNull();
  });
}); 