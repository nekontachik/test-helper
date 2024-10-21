import { createMocks } from 'node-mocks-http';
import handler from '../../../../../../../pages/api/projects/[projectId]/test-runs/[testRunId]/execute';
import prisma from '../../../../../../../lib/prisma';
import { getSession } from 'next-auth/react';

jest.mock('next-auth/react');
jest.mock('../../../../../../../lib/prisma', () => ({
  testRun: {
    update: jest.fn(),
  },
  testCaseResult: {
    createMany: jest.fn(),
  },
}));

describe('/api/projects/[projectId]/test-runs/[testRunId]/execute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('executes a test run successfully', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      query: { projectId: 'project1', testRunId: 'testRun1' },
      body: {
        results: [
          {
            testCaseId: '1',
            status: 'PASSED',
            notes: 'Test passed successfully',
          },
          {
            testCaseId: '2',
            status: 'FAILED',
            notes: 'Test failed due to error',
          },
        ],
      },
    });

    (getSession as jest.Mock).mockResolvedValue({ user: { id: 'user1' } });
    (prisma.testRun.update as jest.Mock).mockResolvedValue({
      id: 'testRun1',
      status: 'COMPLETED',
    });
    (prisma.testCaseResult.createMany as jest.Mock).mockResolvedValue({
      count: 2,
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      data: {
        message: 'Test run executed successfully',
        testRun: {
          id: 'testRun1',
          status: 'COMPLETED',
        },
      },
    });
  });

  it('handles unauthorized access', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      query: { projectId: 'project1', testRunId: 'testRun1' },
    });

    (getSession as jest.Mock).mockResolvedValue(null);

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Unauthorized',
    });
  });

  it('handles validation errors', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      query: { projectId: 'project1', testRunId: 'testRun1' },
      body: {
        // Missing results
      },
    });

    (getSession as jest.Mock).mockResolvedValue({ user: { id: 'user1' } });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: expect.any(String),
    });
  });
});
