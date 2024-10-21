import { createMocks } from 'node-mocks-http';
import { GET, POST } from '@/app/api/projects/route';
import { apiClient } from '@/lib/apiClient';
import rateLimiter from '@/lib/rateLimiter';

jest.mock('@/lib/apiClient');
jest.mock('@/lib/rateLimiter');

describe('/api/projects', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a project successfully', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        name: 'Test Project',
        description: 'Test Description',
      },
    });

    (rateLimiter as jest.Mock).mockResolvedValue(undefined);
    (apiClient.createProject as jest.Mock).mockResolvedValue({
      id: '1',
      name: 'Test Project',
      description: 'Test Description',
    });

    await POST(req as any);

    expect(res._getStatusCode()).toBe(201);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      data: {
        id: '1',
        name: 'Test Project',
        description: 'Test Description',
      },
    });
  });

  it('gets projects successfully with pagination', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { page: '1', limit: '10' },
    });

    (rateLimiter as jest.Mock).mockResolvedValue(undefined);
    (apiClient.getProjects as jest.Mock).mockResolvedValue({
      data: [
        { id: '1', name: 'Project 1' },
        { id: '2', name: 'Project 2' },
      ],
      totalPages: 1,
      currentPage: 1,
    });

    await GET(req as any);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      data: [
        { id: '1', name: 'Project 1' },
        { id: '2', name: 'Project 2' },
      ],
      totalPages: 1,
      currentPage: 1,
    });
  });

  it('handles invalid input for project creation', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        // Missing required 'name' field
        description: 'Test Description',
      },
    });

    (rateLimiter as jest.Mock).mockResolvedValue(undefined);

    await POST(req as any);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Invalid project data',
    });
  });

  it('handles rate limiting', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    (rateLimiter as jest.Mock).mockRejectedValue(
      new Error('Too Many Requests')
    );

    await GET(req as any);

    expect(res._getStatusCode()).toBe(429);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Too Many Requests',
    });
  });
});
