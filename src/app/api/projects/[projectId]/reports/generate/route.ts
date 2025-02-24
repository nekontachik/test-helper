import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { AppError } from '@/lib/errors';
import { dbLogger } from '@/lib/logger';
import { TestCaseResultStatus } from '@/types';
import { Prisma } from '@prisma/client';

const handler = async (
  request: NextRequest,
  { params }: { params: { projectId: string } }
) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new AppError('Unauthorized', 401);
    }

    const body = await request.json();
    const { runId, name, description } = body;

    const testRun = await prisma.testRun.findUnique({
      where: { 
        id: runId,
        projectId: params.projectId,
        status: 'completed'
      },
      include: {
        testRunCases: {
          include: {
            testCase: true
          }
        },
        testResults: {
          include: {
            testCase: true,
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!testRun) {
      throw new AppError('Test run not found or not completed', 404);
    }

    // Calculate statistics
    const totalTests = testRun.testRunCases.length;
    const resultsByStatus = testRun.testResults.reduce((acc: Record<string, number>, result) => {
      acc[result.status] = (acc[result.status] || 0) + 1;
      return acc;
    }, {});

    const statisticsData = {
      totalTests,
      passed: resultsByStatus[TestCaseResultStatus.PASSED] || 0,
      failed: resultsByStatus[TestCaseResultStatus.FAILED] || 0,
      skipped: resultsByStatus[TestCaseResultStatus.SKIPPED] || 0,
      passRate: (resultsByStatus[TestCaseResultStatus.PASSED] || 0) / totalTests * 100
    };

    const resultsData = testRun.testResults.map(result => ({
      testCaseId: result.testCaseId,
      status: result.status,
      notes: result.notes,
      executedBy: result.user.name,
      executedAt: result.createdAt.toISOString()
    }));

    const createData: Prisma.TestReportUncheckedCreateInput = {
      name,
      description,
      projectId: params.projectId,
      runId,
      statistics: statisticsData as unknown as Prisma.JsonValue,
      results: resultsData as unknown as Prisma.JsonValue,
      createdById: session.user.id
    };

    const report = await prisma.testReport.create({
      data: createData
    });

    dbLogger.info('Test report generated', {
      reportId: report.id,
      testRunId: runId,
      projectId: params.projectId
    });

    return NextResponse.json(report);
  } catch (error) {
    dbLogger.error('Error generating test report:', error);
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};

export { handler as POST }; 