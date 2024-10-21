import { NextRequest } from 'next/server';
import { createMocks, RequestMethod } from 'node-mocks-http';
import { GET, POST } from '@/app/api/projects/[projectId]/test-runs/route';
import prisma from '@/lib/prisma';

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

      const { req, res } = createMocks({
        method: 'GET' as RequestMethod,
      });

      req.nextUrl = new URL('http://localhost:3000/api/projects/123/test-runs');
      req.nextUrl.searchParams.append('projectId', '123');

      await GET(req as unknown as NextRequest, {
        params: { projectId: '123' },
      });

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(mockTestRuns);
      expect(prisma.testRun.findMany).toHaveBeenCalledWith({
        where: { projectId: '123' },
      });
    });
  });

  describe('POST', () => {
    it('should create a new test run', async () => {
      const mockTestRun = { id: '1', name: 'New Test Run' };
      (prisma.testRun.create as jest.Mock).mockResolvedValue(mockTestRun);

      const { req, res } = createMocks({
        method: 'POST' as RequestMethod,
        body: {
          name: 'New Test Run',
          description: 'Test run description',
        },
      });

      req.nextUrl = new URL('http://localhost:3000/api/projects/123/test-runs');
      req.nextUrl.searchParams.append('projectId', '123');

      await POST(req as unknown as NextRequest, {
        params: { projectId: '123' },
      });

      expect(res._getStatusCode()).toBe(201);
      expect(JSON.parse(res._getData())).toEqual(mockTestRun);
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
