import type { Prisma, TestCaseResult, TestCase } from '@prisma/client';
import type { ReportInput, ReportMetrics, MetricsResult, TestCasePriority } from './types';
import { calculateMetrics } from '@/lib/utils/testMetrics';
import { ErrorFactory } from '@/lib/errors/ErrorFactory';
import { TEST_RESULT_STATUS, TestResultStatus } from './constants';

interface TestRunCaseWithRelations {
  testCase: TestCase;
  result: TestCaseResult | null;
  status: TestResultStatus;
}

export class ReportMetricsService {
  static async calculateMetrics(tx: Prisma.TransactionClient, data: ReportInput): Promise<MetricsResult> {
    try {
      this.validateMetricsInput(data);

      const testCaseResults = await tx.testCaseResult.findMany({
        where: this.buildMetricsFilter(data),
        include: {
          testCase: true
        }
      });

      if (!testCaseResults.length) {
        return {
          success: false,
          error: {
            code: 'NO_RESULTS',
            message: 'No test results found for the given criteria'
          }
        };
      }

      const validResults = testCaseResults.filter((result): result is (typeof result & { testCase: TestCase }) => {
        return result.testCase !== null && this.isValidTestStatus(result.status);
      });

      if (!validResults.length) {
        return {
          success: false,
          error: {
            code: 'INVALID_RESULTS',
            message: 'No valid test results found'
          }
        };
      }

      const results = validResults.map(result => ({
        ...result,
        testCase: result.testCase,
        status: result.status as TestResultStatus
      }));

      const metrics = calculateMetrics(results);

      return {
        success: true,
        data: metrics
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: error instanceof Error ? 'CALCULATION_ERROR' : 'UNKNOWN_ERROR',
          message: error instanceof Error ? error.message : 'An unknown error occurred',
          details: error
        }
      };
    }
  }

  static buildMetricsFilter(data: ReportInput): Prisma.TestCaseResultWhereInput {
    const conditions: Prisma.TestCaseResultWhereInput[] = [
      {
        testCase: {
          projectId: data.projectId
        }
      }
    ];

    if (data.testRunId) {
      conditions.push({
        testRun: {
          id: data.testRunId
        }
      });
    }

    if (data.filters?.status?.length) {
      conditions.push({
        status: { 
          in: data.filters.status 
        }
      });
    }

    if (data.filters?.dateRange) {
      conditions.push({
        createdAt: {
          gte: data.filters.dateRange.start,
          lte: data.filters.dateRange.end
        }
      });
    }

    if (data.filters?.priority?.length) {
      conditions.push({
        testCase: {
          priority: {
            in: data.filters.priority
          }
        }
      });
    }

    // If we only have the base condition, return it directly
    if (conditions.length === 1) {
      return conditions[0];
    }

    // Otherwise return the AND condition
    return {
      AND: conditions
    };
  }

  private static validateMetricsInput(data: ReportInput): void {
    if (!data.projectId) {
      throw ErrorFactory.validation('Project ID is required');
    }

    if (data.filters?.status?.length) {
      const invalidStatus = data.filters.status.find(
        s => !this.isValidTestStatus(s)
      );
      if (invalidStatus) {
        throw ErrorFactory.validation(`Invalid status: ${invalidStatus}`);
      }
    }

    if (data.filters?.dateRange) {
      const { start, end } = data.filters.dateRange;
      if (!(start instanceof Date) || !(end instanceof Date)) {
        throw ErrorFactory.validation('Date range must contain valid dates');
      }
      if (start > end) {
        throw ErrorFactory.validation('Start date cannot be after end date');
      }
    }

    if (data.filters?.priority?.length) {
      const validPriorities: TestCasePriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
      const invalidPriority = data.filters.priority.find(
        p => !validPriorities.includes(p)
      );
      if (invalidPriority) {
        throw ErrorFactory.validation(`Invalid priority: ${invalidPriority}`);
      }
    }
  }

  private static isValidTestStatus(status: string): status is TestResultStatus {
    return Object.values(TEST_RESULT_STATUS).includes(status as TestResultStatus);
  }
} 