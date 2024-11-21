import { NextRequest } from 'next/server';
import { GET, POST } from './route';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  testCase: {
    findMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
}));

describe('Test Cases API', () => {
  let getHandler: (req: NextRequest) => Promise<any>;
  let postHandler: (req: NextRequest) => Promise<any>;

  beforeAll(async () => {
    getHandler = await GET;
    postHandler = await POST;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return test cases', async () => {
      const mockTestCases = [{ id: '1', title: 'Test Case 1' }];
      (prisma.testCase.findMany as jest.Mock).mockResolvedValue(mockTestCases);
      (prisma.testCase.count as jest.Mock).mockResolvedValue(1);

      const request = new NextRequest(
        'http://localhost:3000/api/projects/1/test-cases?page=1&limit=10',
        {
          method: 'GET',
        }
      );

      const response = await getHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        data: mockTestCases,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });
  });

  describe('POST', () => {
    it('should create a new test case', async () => {
      const mockTestCase = {
        id: '1',
        title: 'New Test Case',
        description: 'Test case description',
        projectId: '1',
      };
      (prisma.testCase.create as jest.Mock).mockResolvedValue(mockTestCase);

      const request = new NextRequest(
        'http://localhost:3000/api/projects/1/test-cases',
        {
          method: 'POST',
          body: JSON.stringify({
            title: 'New Test Case',
            description: 'Test case description',
          }),
        }
      );

      const response = await postHandler(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockTestCase);
      expect(prisma.testCase.create).toHaveBeenCalledWith({
        data: {
          title: 'New Test Case',
          description: 'Test case description',
          projectId: '1',
        },
      });
    });
  });
});
