import { SessionManager } from '../session';
import { prisma } from '@/lib/prisma';
import { AuthError } from '@/lib/errors';

jest.mock('@/lib/prisma', () => ({
  session: {
    count: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
  },
}));

describe('SessionManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSession', () => {
    it('should create a new session when under limit', async () => {
      (prisma.session.count as jest.Mock).mockResolvedValue(0);
      (prisma.session.create as jest.Mock).mockResolvedValue({ id: '1' });

      const result = await SessionManager.createSession({ id: 'user1' });
      expect(result).toEqual({ id: '1' });
    });

    it('should throw error when session limit reached', async () => {
      (prisma.session.count as jest.Mock).mockResolvedValue(5);

      await expect(SessionManager.createSession({ id: 'user1' }))
        .rejects
        .toThrow(AuthError);
    });
  });

  describe('cleanup', () => {
    it('should delete expired sessions', async () => {
      await SessionManager.cleanup();
      expect(prisma.session.deleteMany).toHaveBeenCalled();
    });
  });
}); 