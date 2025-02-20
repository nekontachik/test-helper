import { NextRequest } from 'next/server';
import { GET } from '@/src/app/api/projects/[projectId]/test-runs/[runId]/route';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';

describe('Test Run API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return a test run when authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });
      (prisma.testRun.findUnique as jest.Mock).mockResolvedValue({ id: '1', name: 'Test Run 1', projectId: '1' });

      const request = new NextRequest('http://localhost:3000/api/projects/1/test-runs/1');
      const response = await GET(request, { params: { projectId: '1', runId: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ id: '1', name: 'Test Run 1', projectId: '1' });
    });

    it('should return 401 when not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/projects/1/test-runs/1');
      const response = await GET(request, { params: { projectId: '1', runId: '1' } });

      expect(response.status).toBe(401);
    });

    it('should return 404 when test run not found', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });
      (prisma.testRun.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/projects/1/test-runs/1');
      const response = await GET(request, { params: { projectId: '1', runId: '1' } });

      expect(response.status).toBe(404);
    });
  });

  // ... Similarly update PUT and DELETE tests
}); 