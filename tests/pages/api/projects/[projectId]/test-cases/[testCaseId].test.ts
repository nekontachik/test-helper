import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from '@/app/api/projects/[projectId]/test-cases/[testCaseId]/route';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

jest.mock('next-auth');
jest.mock('@/lib/prisma', () => ({
  testCase: {
    update: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
  testCaseVersion: {
    create: jest.fn(),
  },
}));

describe('/api/projects/[projectId]/test-cases/[testCaseId]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PUT', () => {
    it('updates a test case successfully', async () => {
      const mockBody = {
        title: 'Updated Test Case',
        description: 'Updated Description',
        status: 'ACTIVE',
        priority: 'HIGH',
      };

      const req = new NextRequest('http://localhost:3000/api/projects/project1/test-cases/testCase1', {
        method: 'PUT',
        body: JSON.stringify(mockBody),
      });

      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user1' } });
      (prisma.testCase.findUnique as jest.Mock).mockResolvedValue({ id: 'testCase1', projectId: 'project1', version: 1 });
      (prisma.testCase.update as jest.Mock).mockResolvedValue({
        id: 'testCase1',
        ...mockBody,
        projectId: 'project1',
        version: 2,
      });

      const response = await PUT(req, { params: { projectId: 'project1', testCaseId: 'testCase1' } });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        success: true,
        data: {
          testCase: {
            id: 'testCase1',
            ...mockBody,
            projectId: 'project1',
            version: 2,
          },
        },
      });
    });

    it('handles unauthorized access', async () => {
      const req = new NextRequest('http://localhost:3000/api/projects/project1/test-cases/testCase1', {
        method: 'PUT',
      });

      (getServerSession as jest.Mock).mockResolvedValue(null);

      const response = await PUT(req, { params: { projectId: 'project1', testCaseId: 'testCase1' } });
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData).toEqual({
        success: false,
        error: 'Unauthorized',
      });
    });

    it('handles validation errors', async () => {
      const req = new NextRequest('http://localhost:3000/api/projects/project1/test-cases/testCase1', {
        method: 'PUT',
        body: JSON.stringify({}), // Empty body to trigger validation error
      });

      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user1' } });

      const response = await PUT(req, { params: { projectId: 'project1', testCaseId: 'testCase1' } });
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        success: false,
        error: expect.any(String),
      });
    });
  });

  // Add similar tests for GET method
  describe('GET', () => {
    it('returns a test case successfully', async () => {
      const req = new NextRequest('http://localhost:3000/api/projects/project1/test-cases/testCase1', {
        method: 'GET',
      });

      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user1' } });
      (prisma.testCase.findUnique as jest.Mock).mockResolvedValue({ id: 'testCase1', projectId: 'project1' });

      const response = await GET(req, { params: { projectId: 'project1', testCaseId: 'testCase1' } });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        success: true,
        data: {
          testCase: {
            id: 'testCase1',
            projectId: 'project1',
          },
        },
      });
    });

    // Add more tests for GET method (unauthorized access, not found, etc.)
  });

  // Add similar tests for DELETE method
  describe('DELETE', () => {
    it('deletes a test case successfully', async () => {
      const req = new NextRequest('http://localhost:3000/api/projects/project1/test-cases/testCase1', {
        method: 'DELETE',
      });

      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user1' } });
      (prisma.testCase.findUnique as jest.Mock).mockResolvedValue({ id: 'testCase1', projectId: 'project1' });
      (prisma.testCase.delete as jest.Mock).mockResolvedValue({ id: 'testCase1' });

      const response = await DELETE(req, { params: { projectId: 'project1', testCaseId: 'testCase1' } });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        success: true,
        data: {
          message: 'Test case deleted successfully',
        },
      });
    });

    // Add more tests for DELETE method (unauthorized access, not found, etc.)
  });
});
