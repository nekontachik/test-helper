import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';

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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/projects/[projectId]/test-cases', () => {
    it('should return test cases', async () => {
      const mockTestCases = [{ id: '1', title: 'Test Case 1' }];
      (prisma.testCase.findMany as jest.Mock).mockResolvedValue(mockTestCases);
      (prisma.testCase.count as jest.Mock).mockResolvedValue(1);
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });

      const request = new NextRequest('http://localhost:3000/api/test-cases');
      const response = await GET(request, { params: { projectId: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        data: mockTestCases,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });
  });
});
