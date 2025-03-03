import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/projects/[projectId]/test-runs/route';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  testRun: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
}));

describe('/api/projects/[projectId]/test-runs', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return test runs for a project', async () => {
      const mockTestRuns = [
        { id: '1', name: 'Test Run 1' },
        { id: '2', name: 'Test Run 2' },
      ];
      (prisma.testRun.findMany as jest.Mock).mockResolvedValue(mockTestRuns);

      const url = new URL('http://localhost:3000/api/projects/123/test-runs');
      const request = new NextRequest(url);
      const handler = await GET;
      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockTestRuns);
      expect(prisma.testRun.findMany).toHaveBeenCalledWith({
        where: { projectId: '123' },
      });
    });
  });

  describe('POST', () => {
    it('should create a new test run', async () => {
      const mockTestRun = { id: '1', name: 'New Test Run' };
      (prisma.testRun.create as jest.Mock).mockResolvedValue(mockTestRun);

      const url = new URL('http://localhost:3000/api/projects/123/test-runs');
      const request = new NextRequest(url, {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Test Run',
          description: 'Test run description',
        }),
      });
      const handler = await POST;
      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockTestRun);
      expect(prisma.testRun.create).toHaveBeenCalledWith({
        data: {
          name: 'New Test Run',
          description: 'Test run description',
          projectId: '123',
        },
      });
    });
  });
});
