import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { DELETE } from '../route';

// Mock the dependencies
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn()
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    testReport: {
      findUnique: jest.fn(),
      delete: jest.fn()
    }
  }
}));

describe('Test Report API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('DELETE', () => {
    it('should delete a test report when authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });
      (prisma.testReport.findUnique as jest.Mock).mockResolvedValue({ id: '1', projectId: '1' });
      (prisma.testReport.delete as jest.Mock).mockResolvedValue({ id: '1', name: 'Deleted Test Report' });

      const request = new NextRequest('http://localhost:3000/api/projects/1/test-reports/1', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params: { projectId: '1', reportId: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ message: 'Test report deleted successfully' });
    });

    it('should return 401 when not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/projects/1/test-reports/1', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params: { projectId: '1', reportId: '1' } });

      expect(response.status).toBe(401);
    });

    it('should return 404 when test report not found', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });
      (prisma.testReport.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/projects/1/test-reports/1', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params: { projectId: '1', reportId: '1' } });

      expect(response.status).toBe(404);
    });
  });
}); 