import { createMocks } from 'node-mocks-http';
import projectHandler from '@/pages/api/projects/[projectId]';
import apiClient from '@/lib/apiClient';
import rateLimiter from '@/lib/rateLimiter';

jest.mock('@/lib/apiClient');
jest.mock('@/lib/rateLimiter');

describe('/api/projects/[projectId]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('gets a project successfully', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { projectId: '1' },
    });

    (rateLimiter as jest.Mock).mockResolvedValue(undefined);
    (apiClient.getProject as jest.Mock).mockResolvedValue({
      id: '1',
      name: 'Test Project',
      description: 'Test Description',
    });

    await projectHandler(req as any, res as any);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      data: {
        id: '1',
        name: 'Test Project',
        description: 'Test Description',
      },
    });
  });

  it('updates a project successfully', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
      query: { projectId: '1' },
      body: {
        name: 'Updated Project',
        description: 'Updated Description',
      },
    });

    (rateLimiter as jest.Mock).mockResolvedValue(undefined);
    (apiClient.put as jest.Mock).mockResolvedValue({
      id: '1',
      name: 'Updated Project',
      description: 'Updated Description',
    });

    await projectHandler(req as any, res as any);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      data: {
        id: '1',
        name: 'Updated Project',
        description: 'Updated Description',
      },
    });
  });

  it('deletes a project successfully', async () => {
    const { req, res } = createMocks({
      method: 'DELETE',
      query: { projectId: '1' },
    });

    (rateLimiter as jest.Mock).mockResolvedValue(undefined);
    (apiClient.delete as jest.Mock).mockResolvedValue(undefined);

    await projectHandler(req as any, res as any);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      message: 'Project deleted successfully',
    });
  });

  it('handles not found error', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { projectId: 'nonexistent' },
    });

    (rateLimiter as jest.Mock).mockResolvedValue(undefined);
    (apiClient.getProject as jest.Mock).mockResolvedValue(null);

    await projectHandler(req as any, res as any);

    expect(res._getStatusCode()).toBe(404);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Project not found',
    });
  });

  it('handles invalid input for project update', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
      query: { projectId: '1' },
      body: {
        name: '', // Invalid: empty string
      },
    });

    (rateLimiter as jest.Mock).mockResolvedValue(undefined);

    await projectHandler(req as any, res as any);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Invalid project data',
    });
  });

  it('handles rate limiting', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { projectId: '1' },
    });

    (rateLimiter as jest.Mock).mockRejectedValue(
      new Error('Too Many Requests')
    );

    await projectHandler(req as any, res as any);

    expect(res._getStatusCode()).toBe(429);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Too Many Requests',
    });
  });
});
