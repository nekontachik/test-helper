import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { TestRunStatus } from '@/types';
import type { ApiResponse } from '@/types/api';

jest.mock('@/lib/prisma', () => ({
  testRun: {
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

describe('Test Runs API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return test runs when authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });
      (prisma.testRun.findMany as jest.Mock).mockResolvedValue([{ id: '1', name: 'Test Run 1' }]);
      (prisma.testRun.count as jest.Mock).mockResolvedValue(1);

      const url = new URL('http://localhost:3000/api/projects/1/test-runs?page=1&limit=10');
      const request = new NextRequest(url, {
        method: 'GET'
      });
      Object.defineProperty(request, 'nextUrl', {
        value: url
      });

      const handler = await GET;
      const response = await handler(request, { params: { projectId: '1' } });
      
      // Check if response is an ApiResponse or a Response
      let data;
      if ('success' in response) {
        // It's an ApiResponse
        data = response.data;
        expect(response.success).toBe(true);
      } else {
        // It's a Response
        data = await response.json();
        expect(response.status).toBe(200);
      }

      expect(data).toEqual({
        items: [{ id: '1', name: 'Test Run 1' }],
        currentPage: 1,
        totalPages: 1,
        totalCount: 1,
      });
    });

    it('should return 401 when not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const url = new URL('http://localhost:3000/api/projects/1/test-runs');
      const request = new NextRequest(url, {
        method: 'GET'
      });
      Object.defineProperty(request, 'nextUrl', {
        value: url
      });

      const handler = await GET;
      const response = await handler(request, { params: { projectId: '1' } });

      // Check if response is an ApiResponse or a Response
      if ('success' in response) {
        // It's an ApiResponse
        expect(response.success).toBe(false);
        expect(response.statusCode).toBe(401);
      } else {
        // It's a Response
        expect(response.status).toBe(401);
      }
    });
  });

  describe('POST', () => {
    it('should create a new test run when authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });
      (prisma.testRun.create as jest.Mock).mockResolvedValue({ id: '1', name: 'New Test Run' });

      const url = new URL('http://localhost:3000/api/projects/1/test-runs');
      const request = new NextRequest(url, {
        method: 'POST',
        body: JSON.stringify({ name: 'New Test Run' }),
      });
      Object.defineProperty(request, 'nextUrl', {
        value: url
      });

      const handler = await POST;
      const response = await handler(request, { params: { projectId: '1' } });

      // Check if response is an ApiResponse or a Response
      let data;
      if ('success' in response) {
        // It's an ApiResponse
        data = response.data;
        expect(response.success).toBe(true);
      } else {
        // It's a Response
        data = await response.json();
        expect(response.status).toBe(201);
      }

      expect(data).toEqual({ id: '1', name: 'New Test Run' });
      expect(prisma.testRun.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'New Test Run',
          projectId: '1',
          status: TestRunStatus.IN_PROGRESS,
        }),
      });
    });

    it('should return 401 when not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const url = new URL('http://localhost:3000/api/projects/1/test-runs');
      const request = new NextRequest(url, {
        method: 'POST',
        body: JSON.stringify({ name: 'New Test Run' }),
      });
      Object.defineProperty(request, 'nextUrl', {
        value: url
      });

      const handler = await POST;
      const response = await handler(request, { params: { projectId: '1' } });

      // Check if response is an ApiResponse or a Response
      if ('success' in response) {
        // It's an ApiResponse
        expect(response.success).toBe(false);
        expect(response.statusCode).toBe(401);
      } else {
        // It's a Response
        expect(response.status).toBe(401);
      }
    });

    it('should return 400 when name is missing', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });

      const url = new URL('http://localhost:3000/api/projects/1/test-runs');
      const request = new NextRequest(url, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      Object.defineProperty(request, 'nextUrl', {
        value: url
      });

      const handler = await POST;
      const response = await handler(request, { params: { projectId: '1' } });

      // Check if response is an ApiResponse or a Response
      if ('success' in response) {
        // It's an ApiResponse
        expect(response.success).toBe(false);
        expect(response.statusCode).toBe(400);
      } else {
        // It's a Response
        expect(response.status).toBe(400);
      }
    });
  });
});
