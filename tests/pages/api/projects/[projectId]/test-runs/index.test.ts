import { createMocks } from 'node-mocks-http';
import handler from '../../../../../../pages/api/projects/[projectId]/test-runs';
import { apiClient } from '../../../../../../lib/apiClient';
import { rateLimiter } from '../../../../../../lib/rateLimiter';
import { TestRunStatus } from '../../../../../../types';

jest.mock('../../../../../../lib/apiClient');
jest.mock('../../../../../../lib/rateLimiter');

describe('/api/projects/[projectId]/test-runs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a test run successfully', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      query: { projectId: 'project1' },
      body: {
        name: 'Test Run 1',
        status: TestRunStatus.PENDING,
      },
    });

    (rateLimiter as jest.Mock).mockResolvedValue(undefined);
    (apiClient.createTestRun as jest.Mock).mockResolvedValue({
      id: '1',
      name: 'Test Run 1',
      status: TestRunStatus.PENDING,
      projectId: 'project1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(201);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      data: {
        id: '1',
        name: 'Test Run 1',
        status: TestRunStatus.PENDING,
        projectId: 'project1',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    });
  });

  it('gets test runs successfully with pagination', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { projectId: 'project1', page: '1', limit: '10' },
    });

    (rateLimiter as jest.Mock).mockResolvedValue(undefined);
    (apiClient.getTestRuns as jest.Mock).mockResolvedValue({
      testRuns: [
        { id: '1', name: 'Test Run 1', status: TestRunStatus.PENDING },
        { id: '2', name: 'Test Run 2', status: TestRunStatus.IN_PROGRESS },
      ],
      totalCount: 15,
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      data: [
        { id: '1', name: 'Test Run 1', status: TestRunStatus.PENDING },
        { id: '2', name: 'Test Run 2', status: TestRunStatus.IN_PROGRESS },
      ],
      totalPages: 2,
      currentPage: 1,
    });
  });

  it('handles invalid input for test run creation', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      query: { projectId: 'project1' },
      body: {
        // Missing required 'name' field
        status: 'INVALID_STATUS',
      },
    });

    (rateLimiter as jest.Mock).mockResolvedValue(undefined);

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Invalid test run data',
    });
  });

  it('handles rate limiting', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { projectId: 'project1' },
    });

    (rateLimiter as jest.Mock).mockRejectedValue(
      new Error('Too Many Requests')
    );

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(429);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Too Many Requests',
    });
  });
});
