import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from '../route';
import {prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';

jest.mock('@/lib/prisma', () => ({
  testReport: {
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

describe('Test Report API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return a test report when authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });
      (prisma.testReport.findUnique as jest.Mock).mockResolvedValue({ id: '1', name: 'Test Report 1', projectId: '1' });

      const request = new NextRequest('http://localhost:3000/api/projects/1/test-reports/1');
      const response = await GET(request, { params: { projectId: '1', testReportId: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ id: '1', name: 'Test Report 1', projectId: '1' });
    });

    it('should return 401 when not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/projects/1/test-reports/1');
      const response = await GET(request, { params: { projectId: '1', testReportId: '1' } });

      expect(response.status).toBe(401);
    });

    it('should return 404 when test report not found', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });
      (prisma.testReport.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/projects/1/test-reports/1');
      const response = await GET(request, { params: { projectId: '1', testReportId: '1' } });

      expect(response.status).toBe(404);
    });
  });

  describe('PUT', () => {
    it('should update a test report when authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });
      (prisma.testReport.findUnique as jest.Mock).mockResolvedValue({ id: '1', projectId: '1' });
      (prisma.testReport.update as jest.Mock).mockResolvedValue({ id: '1', name: 'Updated Test Report' });

      const request = new NextRequest('http://localhost:3000/api/projects/1/test-reports/1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Test Report' }),
      });
      const response = await PUT(request, { params: { projectId: '1', testReportId: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ id: '1', name: 'Updated Test Report' });
    });

    it('should return 401 when not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/projects/1/test-reports/1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Test Report' }),
      });
      const response = await PUT(request, { params: { projectId: '1', testReportId: '1' } });

      expect(response.status).toBe(401);
    });

    it('should return 404 when test report not found', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });
      (prisma.testReport.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/projects/1/test-reports/1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Test Report' }),
      });
      const response = await PUT(request, { params: { projectId: '1', testReportId: '1' } });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE', () => {
    it('should delete a test report when authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });
      (prisma.testReport.findUnique as jest.Mock).mockResolvedValue({ id: '1', projectId: '1' });
      (prisma.testReport.delete as jest.Mock).mockResolvedValue({ id: '1', name: 'Deleted Test Report' });

      const request = new NextRequest('http://localhost:3000/api/projects/1/test-reports/1', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params: { projectId: '1', testReportId: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ message: 'Test report deleted successfully' });
    });

    it('should return 401 when not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/projects/1/test-reports/1', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params: { projectId: '1', testReportId: '1' } });

      expect(response.status).toBe(401);
    });

    it('should return 404 when test report not found', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });
      (prisma.testReport.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/projects/1/test-reports/1', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params: { projectId: '1', testReportId: '1' } });

      expect(response.status).toBe(404);
    });
  });
});
