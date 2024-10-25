import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { UserRole } from '@/types/auth';
import { TestCaseStatus, TestCasePriority } from '@/types';

jest.mock('@/lib/prisma', () => ({
  testCase: {
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

describe('Test Cases API', () => {
  const mockToken = {
    role: UserRole.TESTER,
  };

  const mockTestCase = {
    title: 'Test Case 1',
    description: 'Description',
    steps: 'Step 1\nStep 2',
    expectedResult: 'Expected result',
    priority: TestCasePriority.HIGH,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return test cases when authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });
      (prisma.testCase.findMany as jest.Mock).mockResolvedValue([{ id: '1', title: 'Test Case 1' }]);
      (prisma.testCase.count as jest.Mock).mockResolvedValue(1);

      const url = new URL('http://localhost:3000/api/projects/1/test-cases?page=1&limit=10');
      const request = new NextRequest(url);
      const handler = await GET;
      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        items: [{ id: '1', title: 'Test Case 1' }],
        currentPage: 1,
        totalPages: 1,
        totalCount: 1,
      });
    });

    it('should return 401 when not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const url = new URL('http://localhost:3000/api/projects/1/test-cases');
      const request = new NextRequest(url);
      const handler = await GET;
      const response = await handler(request);

      expect(response.status).toBe(401);
    });
  });

  describe('POST', () => {
    it('should create a new test case when authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });
      (prisma.testCase.create as jest.Mock).mockResolvedValue({ id: '1', title: 'New Test Case' });

      const url = new URL('http://localhost:3000/api/projects/1/test-cases');
      const request = new NextRequest(url, {
        method: 'POST',
        body: JSON.stringify({ title: 'New Test Case', description: 'Description' }),
      });
      const handler = await POST;
      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual({ id: '1', title: 'New Test Case' });
    });

    it('should return 401 when not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const url = new URL('http://localhost:3000/api/projects/1/test-cases');
      const request = new NextRequest(url, {
        method: 'POST',
        body: JSON.stringify({ title: 'New Test Case', description: 'Description' }),
      });
      const handler = await POST;
      const response = await handler(request);

      expect(response.status).toBe(401);
    });

    it('should return 400 when title or description is missing', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });

      const url = new URL('http://localhost:3000/api/projects/1/test-cases');
      const request = new NextRequest(url, {
        method: 'POST',
        body: JSON.stringify({ title: 'New Test Case' }),
      });
      const handler = await POST;
      const response = await handler(request);

      expect(response.status).toBe(400);
    });
  });
});
