import { NextRequest } from 'next/server';
import { createMocks, RequestMethod } from 'node-mocks-http';
import { GET, POST } from './route';
import { prisma } from '@/lib/prisma'; // Fixed: Changed default import to named import

jest.mock('@/lib/prisma', () => ({
  testRun: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
}));

describe('/api/projects/[projectId]/test-runs', () => {
  let getHandler: (req: NextRequest) => Promise<any>;
  let postHandler: (req: NextRequest) => Promise<any>;

  beforeAll(async () => {
    getHandler = await GET;
    postHandler = await POST;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return test runs for a project', async () => {
      const mockTestRuns = [
        { id: '1', name: 'Test Run 1' },
        { id: '2', name: 'Test Run 2' },
      ];
      (prisma.testRun.findMany as jest.Mock).mockResolvedValue(mockTestRuns);

      const req = new NextRequest(
        'http://localhost:3000/api/projects/123/test-runs',
        {
          method: 'GET',
        }
      );

      const response = await getHandler(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockTestRuns);
      expect(prisma.testRun.findMany).toHaveBeenCalledWith({
        where: { projectId: '123' },
      });
    });
  });

  describe('POST', () => {
    it('should create a new test run', async () => {
      const mockTestRun = { id: '1', name: 'New Test Run' };
      (prisma.testRun.create as jest.Mock).mockResolvedValue(mockTestRun);

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

      const response = await postHandler(req);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockTestRun);
      expect(prisma.testRun.create).toHaveBeenCalledWith({
        data: {
          name: 'New Test Run',
          description: 'Test run description',
          projectId: '123',
        },
      });
    });
  });
});
