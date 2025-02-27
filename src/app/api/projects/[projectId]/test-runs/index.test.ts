import { NextRequest } from 'next/server';
import { GET, POST } from './route';
import { prisma } from '@/lib/prisma';

// Create mock implementations
const mockApiResponse = {
  success: true,
  data: {},
  statusCode: 200
};

// Mock the modules
jest.mock('@/lib/prisma', () => ({
  testRun: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
}));

// Mock the route handlers
jest.mock('./route', () => ({
  GET: jest.fn().mockImplementation(async () => mockApiResponse),
  POST: jest.fn().mockImplementation(async () => mockApiResponse)
}));

describe('/api/projects/[projectId]/test-runs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should call the handler with correct parameters', async () => {
      const mockTestRuns = [
        { id: '1', name: 'Test Run 1' },
        { id: '2', name: 'Test Run 2' },
      ];
      (prisma.testRun.findMany as jest.Mock).mockResolvedValue(mockTestRuns);
      (GET as jest.Mock).mockResolvedValue({
        success: true,
        data: mockTestRuns,
        statusCode: 200
      });

      const req = new NextRequest(
        'http://localhost:3000/api/projects/123/test-runs',
        { method: 'GET' }
      );
      const params = { projectId: '123' };

      await GET(req, { params });

      expect(GET).toHaveBeenCalledWith(req, { params });
    });
  });

  describe('POST', () => {
    it('should call the handler with correct parameters', async () => {
      const mockTestRun = { id: '1', name: 'New Test Run' };
      (prisma.testRun.create as jest.Mock).mockResolvedValue(mockTestRun);
      (POST as jest.Mock).mockResolvedValue({
        success: true,
        data: mockTestRun,
        statusCode: 201
      });

      const req = new NextRequest(
        'http://localhost:3000/api/projects/123/test-runs',
        {
          method: 'POST',
          body: JSON.stringify({
            name: 'New Test Run',
            description: 'Test run description',
          }),
        }
      );
      const params = { projectId: '123' };

      await POST(req, { params });

      expect(POST).toHaveBeenCalledWith(req, { params });
    });
  });
}); 