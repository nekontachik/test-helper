import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { AppError } from '@/lib/errors';
import { dbLogger } from '@/lib/logger';
import type { TestCaseResultStatus, TestCasePriority, TestCaseStatus } from '@/types';
import { TestCase } from '@/types';
import type { Prisma } from '@prisma/client';

type TestReportWithRelations = Prisma.TestReportGetPayload<{
  include: {
    project: true;
    testRun: {
      include: {
        testRunCases: {
          include: {
            testCase: true; }; }; }; };
    createdBy: true; }; }>;

export async function GET(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new AppError('Unauthorized', 401); }

    const report = await prisma.testReport.findUnique({
      where: {
        id: params.reportId,
        projectId: params.projectId },
      include: {
        project: true,
        testRun: {
          include: {
            testRunCases: {
              include: {
                testCase: true } } } },
        createdBy: true } }) as TestReportWithRelations | null;

    if (!report) {
      throw new AppError('Report not found', 404); }

    const transformedReport = {
      id: report.id,
      name: report.name,
      description: report.description ?? '',
      projectId: report.projectId,
      runId: report.runId,
      statistics: report.statistics as {
        totalTests: number;
        passed: number;
        failed: number;
        blocked: number;
        skipped: number;
        passRate: number; },
      results: report.results as {
        testCaseId: string;
        status: TestCaseResultStatus;
        notes?: string;
        executedBy: string;
        executedAt: string; }[],
      createdById: report.createdById,
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
      testRun: {
        testCases: report.testRun.testRunCases.map(({ testCase }) => ({
          id: testCase.id,
          title: testCase.title,
          description: testCase.description ?? '',
          steps: JSON.parse(testCase.steps) as string[],
          expectedResult: testCase.expectedResult,
          priority: testCase.priority as TestCasePriority,
          status: testCase.status as TestCaseStatus,
          projectId: testCase.projectId,
          createdAt: testCase.createdAt.toISOString(),
          updatedAt: testCase.updatedAt.toISOString() })) } };

    return NextResponse.json(transformedReport); } catch (error) {
    dbLogger.error('Error fetching test report:', error);
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode }); }
    return createSuccessResponse({ error: 'Internal server error' }, { status: 500 }; }
}
