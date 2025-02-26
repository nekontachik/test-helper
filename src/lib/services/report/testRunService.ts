import type { Prisma } from '@prisma/client';
import type { TestRunData, TestRunWithRelations } from './types';
import { ErrorFactory } from '@/lib/errors/ErrorFactory';
import { TEST_RESULT_STATUS, type TestResultStatus, TEST_RUN_ERROR_CODES, type TestRunErrorCode } from './constants';

interface TestRunOptions {
  projectId: string;
  testCaseIds: string[];
  userId: string;
  title?: string;
}

interface TestRunError {
  code: TestRunErrorCode;
  message: string;
  details?: unknown;
}

interface TestRunResult {
  success: boolean;
  data?: TestRunData;
  error?: TestRunError;
}

interface TestRunExecuteOptions {
  testRunId: string;
  userId: string;
  results?: Array<{
    testCaseId: string;
    status: TestResultStatus;
    notes?: string;
  }>;
}

export class TestRunService {
  static async createTestRun(
    tx: Prisma.TransactionClient,
    options: TestRunOptions
  ): Promise<TestRunResult> {
    try {
      this.validateTestRunInput(options);

      const testCases = await tx.testCase.findMany({
        where: {
          id: { in: options.testCaseIds },
          projectId: options.projectId
        }
      });

      if (testCases.length !== options.testCaseIds.length) {
        return {
          success: false,
          error: {
            code: TEST_RUN_ERROR_CODES.INVALID_TEST_CASES,
            message: 'One or more test cases are invalid or do not belong to the project'
          }
        };
      }

      const testRun = await tx.testRun.create({
        data: {
          name: options.title || `Test Run ${new Date().toISOString()}`,
          projectId: options.projectId,
          userId: options.userId,
          status: TEST_RESULT_STATUS.PENDING,
          testRunCases: {
            create: options.testCaseIds.map(testCaseId => ({
              testCaseId,
              status: TEST_RESULT_STATUS.PENDING,
              userId: options.userId
            }))
          }
        },
        include: {
          testRunCases: {
            include: {
              testCase: true
            }
          }
        }
      }) as TestRunWithRelations;

      return {
        success: true,
        data: this.processTestRunData(testRun)
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: TEST_RUN_ERROR_CODES.EXECUTION_ERROR,
          message: error instanceof Error ? error.message : 'Failed to create test run',
          details: error
        }
      };
    }
  }

  static async updateTestRunStatus(
    tx: Prisma.TransactionClient,
    testRunId: string,
    status: TestResultStatus
  ): Promise<TestRunResult> {
    try {
      if (!this.isValidTestStatus(status)) {
        return {
          success: false,
          error: {
            code: TEST_RUN_ERROR_CODES.INVALID_STATUS,
            message: `Invalid status: ${status}`
          }
        };
      }

      const testRun = await tx.testRun.update({
        where: { id: testRunId },
        data: { 
          status,
          completedAt: status === TEST_RESULT_STATUS.PASSED || 
                      status === TEST_RESULT_STATUS.FAILED || 
                      status === TEST_RESULT_STATUS.SKIPPED 
            ? new Date() 
            : undefined
        },
        include: {
          testRunCases: {
            include: {
              testCase: true
            }
          }
        }
      }) as TestRunWithRelations;

      return {
        success: true,
        data: this.processTestRunData(testRun)
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: TEST_RUN_ERROR_CODES.EXECUTION_ERROR,
          message: error instanceof Error ? error.message : 'Failed to update test run status',
          details: error
        }
      };
    }
  }

  private static validateTestRunInput(options: TestRunOptions): void {
    if (!options.projectId) {
      throw ErrorFactory.validation('Project ID is required');
    }

    if (!options.testCaseIds?.length) {
      throw ErrorFactory.validation('At least one test case must be selected');
    }

    if (!options.userId) {
      throw ErrorFactory.validation('User ID is required');
    }

    if (options.title && options.title.length > 100) {
      throw ErrorFactory.validation('Title cannot exceed 100 characters');
    }
  }

  static async findTestRun(tx: Prisma.TransactionClient, testRunId?: string): Promise<TestRunWithRelations | null> {
    if (!testRunId) return null;

    const testRun = await tx.testRun.findUnique({
        where: { id: testRunId },
        include: {
          testRunCases: {
            include: { 
              testCase: true
            }
          }
        }
    }) as TestRunWithRelations | null;

    if (!testRun) throw ErrorFactory.notFound(`Test run ${testRunId}`);
    return testRun;
  }

  static processTestRunData(testRun: TestRunWithRelations): TestRunData {
    const testRunCases = testRun.testRunCases.map(trc => ({
      testCase: trc.testCase,
      result: null,
      status: trc.status
    }));

    return {
      testRun: {
        testRun,
        testRunCases
      },
      results: testRunCases,
      summary: {
        total: testRun.testRunCases.length,
        passed: testRun.testRunCases.filter(trc => trc.status === TEST_RESULT_STATUS.PASSED).length,
        failed: testRun.testRunCases.filter(trc => trc.status === TEST_RESULT_STATUS.FAILED).length,
        skipped: testRun.testRunCases.filter(trc => trc.status === TEST_RESULT_STATUS.SKIPPED).length,
        duration: testRun.completedAt && testRun.createdAt 
          ? testRun.completedAt.getTime() - testRun.createdAt.getTime()
          : 0
      }
    };
  }

  private static validateExecuteOptions(options: TestRunExecuteOptions): void {
    if (!options.testRunId) {
      throw ErrorFactory.validation('Test run ID is required');
    }

    if (!options.userId) {
      throw ErrorFactory.validation('User ID is required');
    }

    if (options.results?.length) {
      const seenTestCases = new Set<string>();
      
      options.results.forEach(result => {
        if (!result.testCaseId) {
          throw ErrorFactory.validation('Test case ID is required for each result');
        }

        if (seenTestCases.has(result.testCaseId)) {
          throw ErrorFactory.validation(`Duplicate test case ID: ${result.testCaseId}`);
        }
        seenTestCases.add(result.testCaseId);

        if (!this.isValidTestStatus(result.status)) {
          throw ErrorFactory.validation(`Invalid status: ${result.status}`);
        }

        if (result.notes && result.notes.length > 1000) {
          throw ErrorFactory.validation('Notes cannot exceed 1000 characters');
        }
      });
    }
  }

  static async executeTestRun(
    tx: Prisma.TransactionClient,
    options: TestRunExecuteOptions
  ): Promise<TestRunResult> {
    try {
      this.validateExecuteOptions(options);

      // Update test run status and start time
      await tx.testRun.update({
        where: { id: options.testRunId },
        data: {
          status: TEST_RESULT_STATUS.IN_PROGRESS,
          startTime: new Date()
        },
        include: {
          testRunCases: {
            include: {
              testCase: true
            }
          }
        }
      });

      // Update test case results if provided
      if (options.results?.length) {
        await Promise.all(options.results.map(result => 
          tx.testRunCase.update({
            where: {
              testRunId_testCaseId: {
                testRunId: options.testRunId,
                testCaseId: result.testCaseId
              }
            },
            data: {
              status: result.status
            }
          })
        ));
      }

      // Fetch updated test run with all relations
      const finalTestRun = await tx.testRun.findUnique({
        where: { id: options.testRunId },
        include: {
          testRunCases: {
            include: {
              testCase: true
            }
          }
        }
      }) as TestRunWithRelations;

      return {
        success: true,
        data: this.processTestRunData(finalTestRun)
      };
    } catch {
      return {
        success: false,
        error: {
          code: TEST_RUN_ERROR_CODES.EXECUTION_ERROR,
          message: 'Failed to execute test run'
        }
      };
    }
  }

  static async completeTestRun(
    tx: Prisma.TransactionClient,
    testRunId: string
  ): Promise<TestRunResult> {
    try {
      const testRun = await tx.testRun.findUnique({
        where: { id: testRunId },
        include: {
          testRunCases: {
            include: {
              testCase: true
            }
          }
        }
      }) as TestRunWithRelations;

      if (!testRun) {
        return {
          success: false,
          error: {
            code: TEST_RUN_ERROR_CODES.NOT_FOUND,
            message: `Test run ${testRunId} not found`
          }
        };
      }

      const finalStatus = this.calculateFinalStatus(testRun.testRunCases);
      const updatedTestRun = await tx.testRun.update({
        where: { id: testRunId },
        data: {
          status: finalStatus,
          completedAt: new Date()
        },
        include: {
          testRunCases: {
            include: {
              testCase: true
            }
          }
        }
      }) as TestRunWithRelations;

      return {
        success: true,
        data: this.processTestRunData(updatedTestRun)
      };
    } catch {
      return {
        success: false,
        error: {
          code: TEST_RUN_ERROR_CODES.EXECUTION_ERROR,
          message: 'Failed to complete test run'
        }
      };
    }
  }

  private static calculateFinalStatus(testRunCases: TestRunWithRelations['testRunCases']): TestResultStatus {
    const hasFailures = testRunCases.some(trc => trc.status === TEST_RESULT_STATUS.FAILED);
    const allSkipped = testRunCases.every(trc => trc.status === TEST_RESULT_STATUS.SKIPPED);
    
    if (hasFailures) return TEST_RESULT_STATUS.FAILED;
    if (allSkipped) return TEST_RESULT_STATUS.SKIPPED;
    return TEST_RESULT_STATUS.PASSED;
  }

  private static isValidTestStatus(status: string): status is TestResultStatus {
    return Object.values(TEST_RESULT_STATUS).includes(status as TestResultStatus);
  }
} 