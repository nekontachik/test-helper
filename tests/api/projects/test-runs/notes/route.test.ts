import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { UserRole } from '@/types/auth';

jest.mock('@/lib/prisma', () => ({
  testRunNote: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

describe('Test Run Notes API', () => {
  let getHandler: (req: NextRequest) => Promise<any>;
  let postHandler: (req: NextRequest) => Promise<any>;

  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: UserRole.TESTER,
  };

  const mockNote = {
    id: '1',
    content: 'Test note',
    testRunId: 'run-1',
    userId: '1',
    user: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeAll(async () => {
    getHandler = await GET;
    postHandler = await POST;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('should validate content length', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: mockUser });

      const longContent = 'a'.repeat(2001);
      const request = new NextRequest(
        'http://localhost:3000/api/test-runs/1/notes',
        {
          method: 'POST',
          body: JSON.stringify({ content: longContent }),
        }
      );

      const response = await postHandler(request);
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        message: 'Note content exceeds maximum length of 2000 characters',
      });
    });

    it('should create a note when content is valid', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: mockUser });
      (prisma.testRunNote.create as jest.Mock).mockResolvedValue(mockNote);

      const request = new NextRequest(
        'http://localhost:3000/api/test-runs/1/notes',
        {
          method: 'POST',
          body: JSON.stringify({ content: 'Valid note content' }),
        }
      );

      const response = await postHandler(request);
      expect(response.status).toBe(201);
      expect(await response.json()).toEqual(mockNote);
    });

    it('should return 401 when not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost:3000/api/test-runs/1/notes',
        {
          method: 'POST',
          body: JSON.stringify({ content: 'Test note' }),
        }
      );

      const response = await postHandler(request);
      expect(response.status).toBe(401);
    });
  });
});
