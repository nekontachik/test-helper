import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { UserRole } from '@/types/auth'; // Fix: Import from auth types

jest.mock('@/lib/prisma', () => ({
  testCaseComment: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

describe('Test Case Comments API', () => {
  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: UserRole.TESTER,
  };

  const mockComment = {
    id: '1',
    content: 'Test comment',
    testCaseId: 'test-1',
    userId: '1',
    user: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return comments when authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: mockUser });
      (prisma.testCaseComment.findMany as jest.Mock).mockResolvedValue([mockComment]);

      const url = new URL('http://localhost:3000/api/projects/1/test-cases/test-1/comments');
      const request = new NextRequest(url);
      const handler = await GET;
      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([mockComment]);
    });

    it('should return 401 when not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const url = new URL('http://localhost:3000/api/projects/1/test-cases/test-1/comments');
      const request = new NextRequest(url);
      const handler = await GET;
      const response = await handler(request);

      expect(response.status).toBe(401);
    });
  });

  describe('POST', () => {
    it('should create comment when authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: mockUser });
      (prisma.testCaseComment.create as jest.Mock).mockResolvedValue(mockComment);

      const url = new URL('http://localhost:3000/api/projects/1/test-cases/test-1/comments');
      const request = new NextRequest(url, {
        method: 'POST',
        body: JSON.stringify({ content: 'Test comment' }),
      });
      const handler = await POST;
      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockComment);
      expect(prisma.testCaseComment.create).toHaveBeenCalledWith({
        data: {
          content: 'Test comment',
          testCaseId: 'test-1',
          userId: '1',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });

    it('should return 400 when content is missing', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: mockUser });

      const url = new URL('http://localhost:3000/api/projects/1/test-cases/test-1/comments');
      const request = new NextRequest(url, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const handler = await POST;
      const response = await handler(request);

      expect(response.status).toBe(400);
    });
  });
});
