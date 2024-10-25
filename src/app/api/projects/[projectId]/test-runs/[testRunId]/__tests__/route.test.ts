import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from '../route';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';

jest.mock('@/lib/prisma', () => ({
  testRun: {
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

describe('Test Run API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return a test run when authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });
      (prisma.testRun.findUnique as jest.Mock).mockResolvedValue({ id: '1', name: 'Test Run 1', projectId: '1' });

      const request = new NextRequest('http://localhost:3000/api/projects/1/test-runs/1');
      const response = await GET(request, { params: { projectId: '1', testRunId: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ id: '1', name: 'Test Run 1', projectId: '1' });
    });

    it('should return 401 when not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/projects/1/test-runs/1');
      const response = await GET(request, { params: { projectId: '1', testRunId: '1' } });

      expect(response.status).toBe(401);
    });

    it('should return 404 when test run not found', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });
      (prisma.testRun.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/projects/1/test-runs/1');
      const response = await GET(request, { params: { projectId: '1', testRunId: '1' } });

      expect(response.status).toBe(404);
    });
  });

  describe('PUT', () => {
    it('should update a test run when authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });
      (prisma.testRun.findUnique as jest.Mock).mockResolvedValue({ id: '1', projectId: '1' });
      (prisma.testRun.update as jest.Mock).mockResolvedValue({ id: '1', name: 'Updated Test Run' });

      const request = new NextRequest('http://localhost:3000/api/projects/1/test-runs/1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Test Run' }),
      });
      const response = await PUT(request, { params: { projectId: '1', testRunId: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ id: '1', name: 'Updated Test Run' });
    });

    it('should return 401 when not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/projects/1/test-runs/1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Test Run' }),
      });
      const response = await PUT(request, { params: { projectId: '1', testRunId: '1' } });

      expect(response.status).toBe(401);
    });

    it('should return 404 when test run not found', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });
      (prisma.testRun.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/projects/1/test-runs/1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Test Run' }),
      });
      const response = await PUT(request, { params: { projectId: '1', testRunId: '1' } });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE', () => {
    it('should delete a test run when authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });
      (prisma.testRun.findUnique as jest.Mock).mockResolvedValue({ id: '1', projectId: '1' });
      (prisma.testRun.delete as jest.Mock).mockResolvedValue({ id: '1', name: 'Deleted Test Run' });

      const request = new NextRequest('http://localhost:3000/api/projects/1/test-runs/1', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params: { projectId: '1', testRunId: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ message: 'Test run deleted successfully' });
    });

    it('should return 401 when not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/projects/1/test-runs/1', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params: { projectId: '1', testRunId: '1' } });

      expect(response.status).toBe(401);
    });

    it('should return 404 when test run not found', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });
      (prisma.testRun.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/projects/1/test-runs/1', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params: { projectId: '1', testRunId: '1' } });

      expect(response.status).toBe(404);
    });
  });
});
