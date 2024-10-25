import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';

jest.mock('@/lib/prisma', () => ({
  testReport: {
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

describe('Test Reports API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return test reports when authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });
      (prisma.testReport.findMany as jest.Mock).mockResolvedValue([{ id: '1', name: 'Test Report 1' }]);
      (prisma.testReport.count as jest.Mock).mockResolvedValue(1);

      const request = new NextRequest('http://localhost:3000/api/projects/1/test-reports?page=1&limit=10');
      const response = await GET(request, { params: { projectId: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        items: [{ id: '1', name: 'Test Report 1' }],
        currentPage: 1,
        totalPages: 1,
        totalCount: 1,
      });
    });

    it('should return 401 when not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/projects/1/test-reports');
      const response = await GET(request, { params: { projectId: '1' } });

      expect(response.status).toBe(401);
    });
  });

  describe('POST', () => {
    it('should create a new test report when authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });
      (prisma.testReport.create as jest.Mock).mockResolvedValue({ id: '1', name: 'New Test Report' });

      const request = new NextRequest('http://localhost:3000/api/projects/1/test-reports', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Test Report', testRunId: '1' }),
      });
      const response = await POST(request, { params: { projectId: '1' } });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual({ id: '1', name: 'New Test Report' });
    });

    it('should return 401 when not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/projects/1/test-reports', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Test Report', testRunId: '1' }),
      });
      const response = await POST(request, { params: { projectId: '1' } });

      expect(response.status).toBe(401);
    });

    it('should return 400 when name or testRunId is missing', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });

      const request = new NextRequest('http://localhost:3000/api/projects/1/test-reports', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Test Report' }),
      });
      const response = await POST(request, { params: { projectId: '1' } });

      expect(response.status).toBe(400);
    });
  });
});
