import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/projects/route';
import apiClient from '@/lib/apiClient';
import rateLimiter from '@/lib/rateLimiter';

jest.mock('@/lib/apiClient');
jest.mock('@/lib/rateLimiter');

describe('/api/projects', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a project successfully', async () => {
    const url = new URL('http://localhost:3000/api/projects');
    const request = new NextRequest(url, {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Project',
        description: 'Test Description',
      }),
    });

    (rateLimiter as jest.Mock).mockResolvedValue(undefined);
    (apiClient.createProject as jest.Mock).mockResolvedValue({
      id: '1',
      name: 'Test Project',
      description: 'Test Description',
    });

    const handler = await POST;
    const response = await handler(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toEqual({
      success: true,
      data: {
        id: '1',
        name: 'Test Project',
        description: 'Test Description',
      },
    });
  });

  it('gets projects successfully with pagination', async () => {
    const url = new URL('http://localhost:3000/api/projects?page=1&limit=10');
    const request = new NextRequest(url);

    (rateLimiter as jest.Mock).mockResolvedValue(undefined);
    (apiClient.getProjects as jest.Mock).mockResolvedValue({
      data: [
        { id: '1', name: 'Project 1' },
        { id: '2', name: 'Project 2' },
      ],
      totalPages: 1,
      currentPage: 1,
    });

    const handler = await GET;
    const response = await handler(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
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
    const url = new URL('http://localhost:3000/api/projects');
    const request = new NextRequest(url, {
      method: 'POST',
      body: JSON.stringify({
        // Missing required 'name' field
        description: 'Test Description',
      }),
    });

    (rateLimiter as jest.Mock).mockResolvedValue(undefined);

    const handler = await POST;
    const response = await handler(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      success: false,
      error: 'Invalid project data',
    });
  });

  it('handles rate limiting', async () => {
    const url = new URL('http://localhost:3000/api/projects');
    const request = new NextRequest(url);

    (rateLimiter as jest.Mock).mockRejectedValue(
      new Error('Too Many Requests')
    );

    const handler = await GET;
    const response = await handler(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data).toEqual({
      success: false,
      error: 'Too Many Requests',
    });
  });
});
