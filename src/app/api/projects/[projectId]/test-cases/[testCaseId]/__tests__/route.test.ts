import { NextRequest } from 'next/server';
import { PUT, DELETE } from '../route';
import {prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';

jest.mock('@/lib/prisma', () => ({
  testCase: {
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  testCaseVersion: {
    create: jest.fn(),
  },
}));

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

describe('Test Case API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PUT', () => {
    it('should update a test case when authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });
      (prisma.testCase.findUnique as jest.Mock).mockResolvedValue({ id: '1', projectId: '1', version: 1 });
      (prisma.testCase.update as jest.Mock).mockResolvedValue({ id: '1', title: 'Updated Test Case', version: 2 });

      const request = new NextRequest('http://localhost:3000/api/projects/1/test-cases/1', {
        method: 'PUT',
        body: JSON.stringify({ title: 'Updated Test Case', description: 'Updated Description' }),
      });
      const response = await PUT(request, { params: { projectId: '1', testCaseId: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ id: '1', title: 'Updated Test Case', version: 2 });
    });

    it('should return 401 when not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/projects/1/test-cases/1', {
        method: 'PUT',
        body: JSON.stringify({ title: 'Updated Test Case', description: 'Updated Description' }),
      });
      const response = await PUT(request, { params: { projectId: '1', testCaseId: '1' } });

      expect(response.status).toBe(401);
    });

    it('should return 404 when test case not found', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });
      (prisma.testCase.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/projects/1/test-cases/1', {
        method: 'PUT',
        body: JSON.stringify({ title: 'Updated Test Case', description: 'Updated Description' }),
      });
      const response = await PUT(request, { params: { projectId: '1', testCaseId: '1' } });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE', () => {
    it('should delete a test case when authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });
      (prisma.testCase.findUnique as jest.Mock).mockResolvedValue({ id: '1', projectId: '1' });
      (prisma.testCase.delete as jest.Mock).mockResolvedValue({ id: '1', title: 'Deleted Test Case' });

      const request = new NextRequest('http://localhost:3000/api/projects/1/test-cases/1', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params: { projectId: '1', testCaseId: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ message: 'Test case deleted successfully' });
    });

    it('should return 401 when not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/projects/1/test-cases/1', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params: { projectId: '1', testCaseId: '1' } });

      expect(response.status).toBe(401);
    });

    it('should return 404 when test case not found', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });
      (prisma.testCase.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/projects/1/test-cases/1', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params: { projectId: '1', testCaseId: '1' } });

      expect(response.status).toBe(404);
    });
  });
});
