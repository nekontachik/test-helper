import axios from 'axios';
import apiClient from '@/lib/apiClient';
import {
  Project,
  TestCase,
  TestRun,
  TestReport,
  TestCaseStatus,
  TestCasePriority,
  TestRunStatus,
} from '@/types';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Add this import
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

describe('apiClient', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('Projects', () => {
    it('should fetch projects', async () => {
      const mockProjects: Project[] = [
        {
          id: '1',
          name: 'Test Project',
          description: 'Test Description',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: '1',
          status: 'ACTIVE'  // Added missing status field
        },
      ];
      mockedAxios.get.mockResolvedValueOnce({ data: mockProjects });

      const result = await apiClient.getProjects();
      expect(result).toEqual({ data: mockProjects });
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/projects');
    });
  });

  describe('Test Cases', () => {
    it('should fetch test cases', async () => {
      const mockTestCases: TestCase[] = [
        {
          id: '1',
          title: 'Test Case 1',
          description: 'Test description',
          expectedResult: 'Expected Result',
          status: TestCaseStatus.ACTIVE,
          priority: TestCasePriority.HIGH,
          projectId: '1',
          version: 1,
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
          steps: 'Step 1\nStep 2',  // Added missing steps
          actualResult: 'Actual result'  // Added missing actualResult
        },
      ];
      mockedAxios.get.mockResolvedValueOnce({
        data: { data: mockTestCases, totalPages: 1, currentPage: 1 },
      });

      const result = await apiClient.getTestCases('1', { page: 1, limit: 10 });
      expect(result).toEqual({
        data: mockTestCases,
        totalPages: 1,
        currentPage: 1,
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/projects/1/test-cases?page=1&limit=10'
      );
    });
  });

  describe('Test Case Versions', () => {
    it('should fetch a specific test case version', async () => {
      const mockTestCaseVersion: TestCase = {
        id: 'testcase1',
        title: 'Test Case 1 (Version 2)',
        description: 'Updated description',
        status: TestCaseStatus.ACTIVE,
        priority: TestCasePriority.HIGH,
        expectedResult: 'Updated expected result',
        projectId: 'project1',
        version: 2,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        steps: 'Step 1\nStep 2',  // Added missing steps
        actualResult: 'Actual result'  // Added missing actualResult
      };
      mockedAxios.get.mockResolvedValueOnce({ data: mockTestCaseVersion });

      const result = await apiClient.getTestCaseVersion('project1', 'testcase1', 2);
      expect(result).toEqual(mockTestCaseVersion);
    });
  });

  it('creates a test case correctly', async () => {
    const mockNewTestCase = { 
      id: '2', 
      title: 'New Test Case',
      steps: 'Step 1\nStep 2',  // Added missing steps
      actualResult: 'Actual result'  // Added missing actualResult
    };

    const testCaseData = {
      title: 'New Test Case',
      description: 'Test description',
      expectedResult: 'Expected result',
      status: TestCaseStatus.ACTIVE,
      priority: TestCasePriority.HIGH,
      projectId: 'project1',
      steps: 'Step 1\nStep 2',  // Added missing steps
      actualResult: 'Actual result'  // Added missing actualResult
    };

    fetchMock.mockResponseOnce(JSON.stringify(mockNewTestCase));

    const result = await apiClient.createTestCase('project1', testCaseData);

    expect(result).toEqual(mockNewTestCase);
    expect(fetchMock).toHaveBeenCalledWith('/api/projects/project1/test-cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCaseData),
    });
  });
});
