import { createMocks } from 'node-mocks-http';
import handler from '../../../../../../../pages/api/projects/[projectId]/test-runs/[testRunId]/results';
import prisma from '../../../../../../../lib/prisma';
import { getSession } from 'next-auth/react';

jest.mock('next-auth/react');
jest.mock('../../../../../../../lib/prisma', () => ({
  testCaseResult: {
    createMany: jest.fn(),
    findMany: jest.fn(),
  },
}));

describe('/api/projects/[projectId]/test-runs/[testRunId]/results', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates test case results successfully', async () => {
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
    (prisma.testCaseResult.createMany as jest.Mock).mockResolvedValue({
      count: 2,
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      data: {
        message: 'Test case results created successfully',
        count: 2,
      },
    });
  });

  it('gets test case results successfully', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { projectId: 'project1', testRunId: 'testRun1' },
    });

    (getSession as jest.Mock).mockResolvedValue({ user: { id: 'user1' } });
    (prisma.testCaseResult.findMany as jest.Mock).mockResolvedValue([
      {
        id: '1',
        testCaseId: '1',
        status: 'PASSED',
        notes: 'Test passed successfully',
      },
      {
        id: '2',
        testCaseId: '2',
        status: 'FAILED',
        notes: 'Test failed due to error',
      },
    ]);

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      data: {
        results: [
          {
            id: '1',
            testCaseId: '1',
            status: 'PASSED',
            notes: 'Test passed successfully',
          },
          {
            id: '2',
            testCaseId: '2',
            status: 'FAILED',
            notes: 'Test failed due to error',
          },
        ],
      },
    });
  });
});
