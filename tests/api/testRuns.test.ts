import { NextRequest, NextResponse } from 'next/server';
import { createMocks } from 'node-mocks-http';
import prisma from '../../src/lib/prisma';
import {
  GET,
  POST,
} from '../../src/app/api/projects/[projectId]/test-runs/route';

jest.mock('../../src/lib/prisma', () => ({
  testRun: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
}));

describe('Test Runs API', () => {
  it('should return test runs', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { projectId: '1' },
    });

    const mockTestRuns = [{ id: '1', name: 'Test Run 1', status: 'PLANNED' }];
    (prisma.testRun.findMany as jest.Mock).mockResolvedValue(mockTestRuns);

    const response = await GET(req as unknown as NextRequest, {
      params: { projectId: '1' },
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockTestRuns);
    expect(prisma.testRun.findMany).toHaveBeenCalledWith({
      where: { projectId: '1' },
    });
  });

  // Add more tests as needed
});
