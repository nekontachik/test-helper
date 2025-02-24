import { prisma } from '@/lib/prisma';
import type { TestReport, TestRun, TestCase, TestCaseResult, Prisma } from '@prisma/client';
import { BaseService } from '../BaseService';
import { ReportValidationService } from './reportValidationService';
import { ReportMetricsService } from './reportMetricsService';
import { TestRunService } from './testRunService';
import type { ServiceResponse } from '@/lib/utils/serviceResponse';
import type { 
  DetailedReport, 
  PaginatedData, 
  ReportInput, 
  ReportMetrics, 
  TestRunData,
  TestRunWithRelations
} from './types';
import { ServiceErrorHandler } from '../ServiceErrorHandler';
import { calculateMetrics } from '@/lib/utils/testMetrics';
import { ErrorFactory } from '@/lib/errors/ErrorFactory';

const TEST_STATUSES = ['PASSED', 'FAILED', 'SKIPPED'] as const;
type TestStatus = typeof TEST_STATUSES[number];

export class ReportService extends BaseService<TestReport, 'testReport'> {
  constructor() {
    super(prisma.testReport, 'testReport');
  }

  private validateInput(data: ReportInput): void {
    ReportValidationService.validateInput(data);
  }

  private async findTestRun(tx: Prisma.TransactionClient, testRunId?: string): Promise<TestRunWithRelations | null> {
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

  private async calculateMetrics(tx: Prisma.TransactionClient, data: ReportInput): Promise<ReportMetrics> {
    const result = await ReportMetricsService.calculateMetrics(tx, data);
    if (!result.success || !result.data) {
      throw ErrorFactory.validation(result.error?.message || 'Failed to calculate metrics');
    }
    return result.data;
  }

  private processTestRunData(testRun: TestRunWithRelations): TestRunData {
    return TestRunService.processTestRunData(testRun);
  }

  protected withTransaction<T>(
    operation: (tx: Prisma.TransactionClient) => Promise<T>
  ): Promise<ServiceResponse<T>> {
    return ServiceErrorHandler.withTransaction(
      async () => {
        const result = await this.prisma.$transaction(operation);
        return { success: true, data: result };
      }
    );
  }

  async generateReport(data: ReportInput): Promise<ServiceResponse<DetailedReport>> {
    this.validateInput(data);
    
    return this.withTransaction<DetailedReport>(async (tx) => {
      const [testRun, metrics] = await Promise.all([
        this.findTestRun(tx, data.testRunId),
        this.calculateMetrics(tx, data)
      ]);
      
      const testRunData = testRun ? this.processTestRunData(testRun) : undefined;
      const report = await this.createReport(tx, {
        data,
        metrics,
        testRunData,
        userId: (await this.checkAuth()).user.id
      });

      return {
        ...report,
        metrics,
        testRunSummary: testRunData
      };
    });
  }

  private async createReport(tx: Prisma.TransactionClient, params: {
    data: ReportInput;
    metrics: ReportMetrics;
    testRunData?: TestRunData;
    userId: string;
  }): Promise<TestReport> {
    return tx.testReport.create({
      data: {
        title: params.data.title.trim(),
        content: JSON.stringify({ 
          metrics: params.metrics, 
          testRunData: params.testRunData, 
          filters: params.data.filters 
        }),
        projectId: params.data.projectId,
        userId: params.userId
      }
    });
  }

  private calculateSummary(results: Array<{ testCase: TestCase; result: TestCaseResult }>, testRun: TestRun) {
    return {
      total: results.length,
      passed: results.filter(r => r.result.status === 'PASSED').length,
      failed: results.filter(r => r.result.status === 'FAILED').length,
      skipped: results.filter(r => r.result.status === 'SKIPPED').length,
      duration: this.calculateDuration(testRun.completedAt, testRun.createdAt)
    };
  }

  private calculateDuration(completedAt: Date | null, createdAt: Date): number {
    if (!completedAt) return 0;
    return completedAt.getTime() - createdAt.getTime();
  }

  // ... other main service methods
} 