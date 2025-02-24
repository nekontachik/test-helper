import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { testCaseFactory } from '@/lib/test/factories/testCaseFactory';
import { 
  createTestCase,
  updateTestCase,
  getTestCaseVersions,
  bulkCreateTestCases,
  restoreTestCaseVersion,
  type TestCaseData
} from '@/lib/services/testCaseService';
import type { TestCaseInput, TestCaseUpdateInput } from '@/lib/validation/schemas';
import { TestCaseStatusEnum, TestCasePriorityEnum } from '@/lib/validation/schemas';

// Remove unused PrismaClient import and update MockPrismaClient type
type MockPrismaClient = {
  testCase: {
    create: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
  };
  testCaseVersion: {
    create: jest.Mock;
    findMany: jest.Mock;
    findFirst: jest.Mock;
  };
  testResult: {
    deleteMany: jest.Mock;
  };
  $transaction: jest.Mock;
};

jest.mock('next-auth');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    testCase: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    testCaseVersion: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    testResult: {
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
  } as unknown as MockPrismaClient,
}));

describe('testCaseService', () => {
  const mockUser = { id: 'user-1', email: 'test@example.com' };
  const mockSession = { user: mockUser };
  const mockTestCase = testCaseFactory.createTestCase({
    id: 'test-1',
    title: 'Test Case 1',
    description: 'Description',
    steps: 'Step 1\nStep 2',
    expectedResult: 'Expected result',
    status: TestCaseStatusEnum.enum.ACTIVE,
    priority: TestCasePriorityEnum.enum.HIGH,
    projectId: 'project-1',
    userId: mockUser.id,
    currentVersion: 1
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
  });

  describe('createTestCase', () => {
    it('should create test case with initial version', async () => {
      const testCaseData: TestCaseInput = {
        title: 'Test Case 1',
        steps: 'Step 1\nStep 2',
        expectedResult: 'Expected result',
        actualResult: '',
        status: 'ACTIVE',
        priority: 'HIGH',
        projectId: 'project-1'
      };

      (prisma.testCase.create as jest.Mock).mockResolvedValue(mockTestCase);
      (prisma.testCaseVersion.create as jest.Mock).mockResolvedValue({
        id: 'version-1',
        testCaseId: 'test-1',
        versionNumber: 1,
      });

      const result = await createTestCase('project-1', testCaseData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTestCase);
      expect(prisma.testCaseVersion.create).toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      const invalidData = {
        title: '',  // Invalid: empty title
        steps: [],  // Invalid: empty steps
      };

      const result = await createTestCase('project-1', invalidData as any);
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('updateTestCase', () => {
    it('should update test case and create new version', async () => {
      const updateData: Partial<TestCaseData> = {
        title: 'Updated Title',
        steps: 'Updated Step 1',
      };

      (prisma.testCase.findUnique as jest.Mock).mockResolvedValue({
        ...mockTestCase,
        versions: [{ versionNumber: 1 }],
      });

      const updatedTestCase = {
        ...mockTestCase,
        ...updateData,
        currentVersion: 2,
      };

      (prisma.testCase.update as jest.Mock).mockResolvedValue(updatedTestCase);

      const result = await updateTestCase('test-1', updateData, 'Updated title and steps');
      expect(result.success).toBe(true);
      expect(result.data?.title).toBe('Updated Title');
      expect(result.data?.currentVersion).toBe(2);
    });
  });

  describe('getTestCaseVersions', () => {
    it('should return version history', async () => {
      const mockVersions = [
        {
          id: 'version-2',
          versionNumber: 2,
          changes: 'Updated title',
          data: JSON.stringify({ title: 'Updated Title' }),
          user: mockUser,
          testCaseId: 'test-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'version-1',
          versionNumber: 1,
          changes: 'Initial version',
          data: JSON.stringify(mockTestCase),
          user: mockUser,
          testCaseId: 'test-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.testCaseVersion.findMany as jest.Mock).mockResolvedValue(mockVersions);

      const result = await getTestCaseVersions('test-1');
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      if (result.data) {
        expect(result.data).toHaveLength(2);
        expect(result.data[0].versionNumber).toBe(2);
        expect(result.data[1].versionNumber).toBe(1);
      }
    });

    it('should handle unauthorized access', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const result = await getTestCaseVersions('test-1');
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('UNAUTHORIZED');
    });
  });

  describe('bulkCreateTestCases', () => {
    it('should create multiple test cases with versions', async () => {
      const testCases: TestCaseInput[] = [
        {
          title: 'Test Case 1',
          steps: 'Step 1',
          expectedResult: 'Expected 1',
          actualResult: '',
          status: 'ACTIVE',
          priority: 'HIGH',
          projectId: 'project-1'
        },
        {
          title: 'Test Case 2',
          steps: 'Step 2',
          expectedResult: 'Expected 2',
          actualResult: '',
          status: 'ACTIVE',
          priority: 'HIGH',
          projectId: 'project-1'
        }
      ];

      const mockCreatedTestCases = testCases.map((data, index) => ({
        ...testCaseFactory.createTestCase({
          ...data,
          id: `test-${index + 1}`,
          projectId: 'project-1',
          userId: mockUser.id,
        })
      }));

      (prisma.testCase.create as jest.Mock)
        .mockImplementation((_args) => {
          const index = mockCreatedTestCases.length - 1;
          return Promise.resolve(mockCreatedTestCases[index]);
        });

      const result = await bulkCreateTestCases('project-1', testCases);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(prisma.testCase.create).toHaveBeenCalledTimes(2);
      expect(prisma.testCaseVersion.create).toHaveBeenCalledTimes(2);
    });

    it('should handle validation errors in bulk creation', async () => {
      const invalidTestCases = [
        { title: '', steps: [] }, // Invalid
        testCaseFactory.createTestCase(), // Valid
      ];

      const result = await bulkCreateTestCases('project-1', invalidTestCases as any[]);
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
      expect(prisma.testCase.create).not.toHaveBeenCalled();
    });
  });

  describe('restoreTestCaseVersion', () => {
    it('should restore test case to previous version', async () => {
      const oldVersion = testCaseFactory.createTestCaseVersion(mockTestCase, 1);

      (prisma.testCaseVersion.findFirst as jest.Mock).mockResolvedValue({
        ...oldVersion,
        data: JSON.stringify(oldVersion),
      });

      const result = await restoreTestCaseVersion('test-1', 1);
      expect(result.success).toBe(true);
      expect(result.data?.currentVersion).toBe(2);
      expect(prisma.testCaseVersion.create).toHaveBeenCalled();
    });

    it('should validate version number', async () => {
      const result = await restoreTestCaseVersion('test-1', -1);
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
    });
  });
}); 