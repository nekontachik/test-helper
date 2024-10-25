import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/projects/[projectId]/test-cases/route';
import { prisma } from '@/lib/prisma';
import { TestCaseStatus, TestCasePriority } from '@/types';
import { getServerSession } from 'next-auth/next';

jest.mock('@/lib/prisma', () => ({
  testCase: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  project: {
    findUnique: jest.fn(),
  },
}));

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

describe('Test Cases API', () => {
  const mockSession = { user: { id: 'user1' } };

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
  });

  describe('GET /api/projects/[projectId]/test-cases', () => {
    it('should return test cases for a project', async () => {
      const mockTestCases = [
        { id: '1', title: 'Test Case 1' },
        { id: '2', title: 'Test Case 2' },
      ];
      (prisma.testCase.findMany as jest.Mock).mockResolvedValue(mockTestCases);
      (prisma.testCase.count as jest.Mock).mockResolvedValue(2);

      const url = new URL('http://localhost:3000/api/projects/project1/test-cases?page=1&limit=10');
      const request = new NextRequest(url);
      const handler = await GET;
      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.items).toEqual(mockTestCases);
      expect(data.totalPages).toBe(1);
      expect(data.currentPage).toBe(1);
    });

    it('should handle empty test case list', async () => {
      (prisma.testCase.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.testCase.count as jest.Mock).mockResolvedValue(0);

      const url = new URL('http://localhost:3000/api/projects/project1/test-cases?page=1&limit=10');
      const request = new NextRequest(url);
      const handler = await GET;
      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.items).toEqual([]);
      expect(data.totalPages).toBe(0);
      expect(data.currentPage).toBe(1);
    });

    it('should handle invalid pagination parameters', async () => {
      const url = new URL('http://localhost:3000/api/projects/project1/test-cases?page=invalid&limit=invalid');
      const request = new NextRequest(url);
      const handler = await GET;
      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.currentPage).toBe(1); // Should default to 1
    });

    it('should return 401 if not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const url = new URL('http://localhost:3000/api/projects/project1/test-cases');
      const request = new NextRequest(url);
      const handler = await GET;
      const response = await handler(request);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/projects/[projectId]/test-cases', () => {
    it('should create a new test case', async () => {
      const mockTestCase = {
        id: '1',
        title: 'New Test Case',
        description: 'Description',
        status: TestCaseStatus.ACTIVE,
        priority: TestCasePriority.HIGH,
      };
      (prisma.project.findUnique as jest.Mock).mockResolvedValue({ id: 'project1' });
      (prisma.testCase.create as jest.Mock).mockResolvedValue(mockTestCase);

      const url = new URL('http://localhost:3000/api/projects/project1/test-cases');
      const request = new NextRequest(url, {
        method: 'POST',
        body: JSON.stringify(mockTestCase),
      });
      const handler = await POST;
      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockTestCase);
    });

    it('should return 404 if project not found', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);

      const url = new URL('http://localhost:3000/api/projects/project1/test-cases');
      const request = new NextRequest(url, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const handler = await POST;
      const response = await handler(request);

      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid test case data', async () => {
      const invalidTestCase = {
        title: '', // Empty title
        description: 'Description',
        status: 'INVALID_STATUS',
        priority: 'INVALID_PRIORITY',
      };

      const url = new URL('http://localhost:3000/api/projects/project1/test-cases');
      const request = new NextRequest(url, {
        method: 'POST',
        body: JSON.stringify(invalidTestCase),
      });
      const handler = await POST;
      const response = await handler(request);

      expect(response.status).toBe(400);
    });
  });
});
