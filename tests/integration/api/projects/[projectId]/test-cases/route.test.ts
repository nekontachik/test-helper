import { GET, POST } from '@/app/api/projects/[projectId]/test-cases/route';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';

jest.mock('@/lib/prisma');
jest.mock('next-auth/next');

describe('Test Cases API', () => {
  const mockSession = {
    user: { id: 'user-1', email: 'test@example.com' }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
  });

  describe('GET', () => {
    it('should return test cases for project', async () => {
      const mockTestCases = [
        { id: 'test-1', title: 'Test 1' },
        { id: 'test-2', title: 'Test 2' }
      ];

      (prisma.testCase.findMany as jest.Mock).mockResolvedValue(mockTestCases);

      const response = await GET(
        new Request('http://localhost:3000/api/projects/project-1/test-cases')
      );
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockTestCases);
    });
  });

  describe('POST', () => {
    it('should create new test case', async () => {
      const mockTestCase = {
        id: 'test-1',
        title: 'New Test',
        projectId: 'project-1'
      };

      (prisma.testCase.create as jest.Mock).mockResolvedValue(mockTestCase);

      const response = await POST(
        new Request('http://localhost:3000/api/projects/project-1/test-cases', {
          method: 'POST',
          body: JSON.stringify({ title: 'New Test' })
        })
      );
      
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toEqual(mockTestCase);
    });
  });
}); 