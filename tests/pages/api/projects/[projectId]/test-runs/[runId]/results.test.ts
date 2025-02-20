import { createMocks } from 'node-mocks-http';
import { GET, POST } from '@/app/api/projects/[projectId]/test-runs/[runId]/results/route';
import {prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { NextRequest } from 'next/server';

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  testCaseResult: {
    createMany: jest.fn(),
    findMany: jest.fn(),
  },
}));

describe('/api/projects/[projectId]/test-runs/[testRunId]/results', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns test case results when authenticated', async () => {
      const mockResults = [{ id: '1', status: 'PASSED' }];
      (prisma.testCaseResult.findMany as jest.Mock).mockResolvedValue(mockResults);
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user1' } });

      const { req, res } = createMocks({
        method: 'GET',
      });

      const response = await GET(req as unknown as NextRequest, {
        params: { projectId: 'project1', testRunId: 'testRun1' },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockResults);
    });

    it('handles unauthorized access', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      });

      (getServerSession as jest.Mock).mockResolvedValue(null);

      const response = await GET(req as unknown as NextRequest, {
        params: { projectId: 'project1', testRunId: 'testRun1' },
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        success: false,
        error: 'Unauthorized',
      });
    });
  });

  describe('POST', () => {
    it('creates test case results when authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user1' } });
      (prisma.testCaseResult.createMany as jest.Mock).mockResolvedValue({ count: 2 });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          results: [
            { testCaseId: '1', status: 'PASSED' },
            { testCaseId: '2', status: 'FAILED' },
          ],
        },
      });

      const response = await POST(req as unknown as NextRequest, {
        params: { projectId: 'project1', testRunId: 'testRun1' },
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual({ success: true, count: 2 });
    });

    it('handles unauthorized access', async () => {
      const { req, res } = createMocks({
        method: 'POST',
      });

      (getServerSession as jest.Mock).mockResolvedValue(null);

      const response = await POST(req as unknown as NextRequest, {
        params: { projectId: 'project1', testRunId: 'testRun1' },
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        success: false,
        error: 'Unauthorized',
      });
    });
  });
});
