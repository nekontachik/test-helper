import { generateEmailToken, verifyEmailToken } from '../tokens';
import { sendVerificationEmail } from '../../emailService';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn().mockResolvedValue({ id: 'mock-email-id' }),
    },
  })),
}));

describe('Email Verification', () => {
  const mockEmail = 'test@example.com';
  const mockName = 'Test User';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate and verify email tokens', async () => {
    const token = await generateEmailToken(mockEmail);
    expect(token).toBeDefined();

    const payload = await verifyEmailToken(token);
    expect(payload).toBeDefined();
    expect(payload.email).toBe(mockEmail);
  });

  it('should send verification email', async () => {
    await sendVerificationEmail(mockEmail, mockName);
    expect(Resend).toHaveBeenCalled();
  });

  it('should handle email verification', async () => {
    const mockUser = {
      id: '1',
      email: mockEmail,
      emailVerified: null,
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (prisma.user.update as jest.Mock).mockResolvedValue({
      ...mockUser,
      emailVerified: expect.any(Date),
    });

    const token = await generateEmailToken(mockEmail);
    const response = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    expect(response.status).toBe(200);
    expect(prisma.user.update).toHaveBeenCalled();
  });
}); 