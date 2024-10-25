import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { UserRole } from '@/types/auth';

jest.mock('@/lib/prisma', () => ({
  testSuite: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

describe('Test Suites API', () => {
  const mockUser = {
    id: '1',
    role: UserRole.PROJECT_MANAGER,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return test suites when authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: mockUser });
      (prisma.testSuite.findMany as jest.Mock).mockResolvedValue([
        { id: '1', name: 'Test Suite 1' },
      ]);

      const url = new URL('http://localhost:3000/api/projects/1/test-suites');
      const request = new NextRequest(url);
      const handler = await GET;
      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([{ id: '1', name: 'Test Suite 1' }]);
    });

    it('should return 401 when not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const url = new URL('http://localhost:3000/api/projects/1/test-suites');
      const request = new NextRequest(url);
      const handler = await GET;
      const response = await handler(request);

      expect(response.status).toBe(401);
    });
  });

  describe('POST', () => {
    const mockTestSuite = {
      name: 'New Test Suite',
      description: 'Description',
      testCaseIds: ['1', '2'],
    };

    it('should create a test suite when authenticated as PROJECT_MANAGER', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: mockUser });
      (prisma.testSuite.create as jest.Mock).mockResolvedValue({
        id: '1',
        ...mockTestSuite,
      });

      const url = new URL('http://localhost:3000/api/projects/1/test-suites');
      const request = new NextRequest(url, {
        method: 'POST',
        body: JSON.stringify(mockTestSuite),
      });
      const handler = await POST;
      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual({ id: '1', ...mockTestSuite });
    });

    it('should return 403 when authenticated as TESTER', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { ...mockUser, role: UserRole.TESTER },
      });

      const url = new URL('http://localhost:3000/api/projects/1/test-suites');
      const request = new NextRequest(url, {
        method: 'POST',
        body: JSON.stringify(mockTestSuite),
      });
      const handler = await POST;
      const response = await handler(request);

      expect(response.status).toBe(403);
    });
  });
});
