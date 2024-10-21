import axios from 'axios';
import { apiClient } from '@/lib/apiClient';
import {
  Project,
  TestCase,
  TestRun,
  TestReport,
  TestCaseStatus,
  TestCasePriority,
  TestRunStatus,
} from '@/types';
import fetchMock from 'jest-fetch-mock';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

fetchMock.enableMocks();

describe('apiClient', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    fetchMock.resetMocks();
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
        },
      ];
      mockedAxios.get.mockResolvedValueOnce({ data: mockProjects });

      const result = await apiClient.getProjects();
      expect(result).toEqual({ data: mockProjects });
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/projects');
    });

    // Add more tests for other project-related methods
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
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockedAxios.get.mockResolvedValueOnce({
        data: { data: mockTestCases, totalPages: 1, currentPage: 1 },
      });

      const result = await apiClient.getTestCases('1');
      expect(result).toEqual({
        data: mockTestCases,
        totalPages: 1,
        currentPage: 1,
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/projects/1/test-cases'
      );
    });

    // Add more tests for other test case-related methods
  });

  describe('Test Runs', () => {
    it('should fetch test runs', async () => {
      const mockTestRuns: TestRun[] = [
        {
          id: '1',
          name: 'Test Run 1',
          status: TestRunStatus.IN_PROGRESS,
          projectId: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockedAxios.get.mockResolvedValueOnce({
        data: { data: mockTestRuns, totalPages: 1, currentPage: 1 },
      });

      const result = await apiClient.getTestRuns('1');
      expect(result).toEqual({
        data: mockTestRuns,
        totalPages: 1,
        currentPage: 1,
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/projects/1/test-runs'
      );
    });

    // Add more tests for other test run-related methods
  });

  describe('Test Reports', () => {
    it('should fetch test reports', async () => {
      const mockTestReports: TestReport[] = [
        {
          id: '1',
          name: 'Test Report 1',
          description: 'Test Report Description',
          projectId: '1',
          testRunId: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockedAxios.get.mockResolvedValueOnce({ data: mockTestReports });

      const result = await apiClient.getTestReports('1');
      expect(result).toEqual(mockTestReports);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/projects/1/test-reports'
      );
    });
  });

  describe('Test Case Versions', () => {
    it('should fetch test case versions', async () => {
      const mockVersions = [1, 2, 3];
      mockedAxios.get.mockResolvedValueOnce({ data: mockVersions });

      const result = await apiClient.getTestCaseVersions('project1', 'testcase1');
      expect(result).toEqual(mockVersions);
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/projects/project1/test-cases/testcase1/versions');
    });

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
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockedAxios.get.mockResolvedValueOnce({ data: mockTestCaseVersion });

      const result = await apiClient.getTestCaseVersion('project1', 'testcase1', 2);
      expect(result).toEqual(mockTestCaseVersion);
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/projects/project1/test-cases/testcase1/versions/2');
    });
  });

  it('creates a test case correctly', async () => {
    const mockNewTestCase = { id: '2', title: 'New Test Case' };
    fetchMock.mockResponseOnce(JSON.stringify(mockNewTestCase));

    const result = await apiClient.createTestCase('project1', { 
      title: 'New Test Case',
      description: 'Test description',
      expectedResult: 'Expected result',
      status: TestCaseStatus.ACTIVE,
      priority: TestCasePriority.HIGH,
      projectId: 'project1'
    });

    expect(result).toEqual(mockNewTestCase);
    expect(fetchMock).toHaveBeenCalledWith('/api/projects/project1/test-cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        title: 'New Test Case',
        description: 'Test description',
        expectedResult: 'Expected result',
        status: TestCaseStatus.ACTIVE,
        priority: TestCasePriority.HIGH,
        projectId: 'project1'
      }),
    });
  });
});
