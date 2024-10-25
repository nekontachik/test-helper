import { NextRequest } from 'next/server';
import { GET } from '../route';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { UserRole } from '@/types/auth';

jest.mock('@/lib/prisma', () => ({
  testRun: {
    findMany: jest.fn(),
  },
}));

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

describe('Test Reports API', () => {
  let getHandler: (req: NextRequest) => Promise<any>;

  const mockUser = {
    id: '1',
    role: UserRole.PROJECT_MANAGER,
  };

  const mockTestRun = {
    id: '1',
    name: 'Test Run 1',
    completedAt: new Date(),
    testCases: [
      { id: '1', title: 'Test Case 1' },
      { id: '2', title: 'Test Case 2' },
    ],
    testCaseResults: [
      { status: 'PASSED', testCase: { id: '1', title: 'Test Case 1' }, notes: 'Passed' },
      { status: 'FAILED', testCase: { id: '2', title: 'Test Case 2' }, notes: 'Failed' },
    ],
  };

  beforeAll(async () => {
    getHandler = await GET;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return test reports when authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: mockUser });
      (prisma.testRun.findMany as jest.Mock).mockResolvedValue([mockTestRun]);

      const request = new NextRequest('http://localhost:3000/api/projects/1/reports');
      const response = await getHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([
        expect.objectContaining({
          id: '1',
          name: 'Test Run 1',
          totalTests: 2,
          passedTests: 1,
          failedTests: 1,
          skippedTests: 0,
        }),
      ]);
    });

    it('should return 401 when not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/projects/1/reports');
      const response = await getHandler(request);

      expect(response.status).toBe(401);
    });
  });
});
