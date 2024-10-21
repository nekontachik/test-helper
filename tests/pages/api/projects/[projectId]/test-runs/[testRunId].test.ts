import { createMocks } from 'node-mocks-http';
import handler from '../../../../../../pages/api/projects/[projectId]/test-runs/[testRunId]';
import { apiClient } from '../../../../../../lib/apiClient';
import { rateLimiter } from '../../../../../../lib/rateLimiter';
import { TestRunStatus } from '../../../../../../types';

jest.mock('../../../../../../lib/apiClient');
jest.mock('../../../../../../lib/rateLimiter');

describe('/api/projects/[projectId]/test-runs/[testRunId]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('gets a test run successfully', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { projectId: 'project1', testRunId: 'testRun1' },
    });

    (rateLimiter as jest.Mock).mockResolvedValue(undefined);
    (apiClient.getTestRun as jest.Mock).mockResolvedValue({
      id: 'testRun1',
      name: 'Test Run 1',
      status: TestRunStatus.PENDING,
      projectId: 'project1',
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      data: {
        id: 'testRun1',
        name: 'Test Run 1',
        status: TestRunStatus.PENDING,
        projectId: 'project1',
      },
    });
  });

  it('updates a test run successfully', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
      query: { projectId: 'project1', testRunId: 'testRun1' },
      body: {
        name: 'Updated Test Run',
        status: TestRunStatus.COMPLETED,
      },
    });

    (rateLimiter as jest.Mock).mockResolvedValue(undefined);
    (apiClient.updateTestRun as jest.Mock).mockResolvedValue({
      id: 'testRun1',
      name: 'Updated Test Run',
      status: TestRunStatus.COMPLETED,
      projectId: 'project1',
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      data: {
        id: 'testRun1',
        name: 'Updated Test Run',
        status: TestRunStatus.COMPLETED,
        projectId: 'project1',
      },
    });
  });

  it('deletes a test run successfully', async () => {
    const { req, res } = createMocks({
      method: 'DELETE',
      query: { projectId: 'project1', testRunId: 'testRun1' },
    });

    (rateLimiter as jest.Mock).mockResolvedValue(undefined);
    (apiClient.deleteTestRun as jest.Mock).mockResolvedValue({
      id: 'testRun1',
      name: 'Deleted Test Run',
      status: TestRunStatus.COMPLETED,
      projectId: 'project1',
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      data: {
        id: 'testRun1',
        name: 'Deleted Test Run',
        status: TestRunStatus.COMPLETED,
        projectId: 'project1',
      },
    });
  });

  it('handles not found error', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { projectId: 'project1', testRunId: 'nonexistent' },
    });

    (rateLimiter as jest.Mock).mockResolvedValue(undefined);
    (apiClient.getTestRun as jest.Mock).mockResolvedValue(null);

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(404);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Test run not found',
    });
  });

  it('handles invalid input for test run update', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
      query: { projectId: 'project1', testRunId: 'testRun1' },
      body: {
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
      query: { projectId: 'project1', testRunId: 'testRun1' },
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
