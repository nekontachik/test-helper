import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { TestResultStatus } from '@/types/testRun';
import { logger } from '@/lib/logger';

export async function GET(
  _req: NextRequest,
  { params }: { params: { projectId: string; runId: string } }
): Promise<Response> {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get test run with results
    const testRun = await prisma.testRun.findUnique({
      where: {
        id: params.runId,
        projectId: params.projectId
      },
      include: {
        testRunCases: {
          include: {
            testCase: {
              select: {
                id: true,
                title: true,
                priority: true,
                status: true,
                description: true
              }
            }
          }
        },
        testResults: {
          select: {
            id: true,
            status: true,
            testCaseId: true,
            notes: true,
            evidence: true,
            executedById: true,
            executedAt: true,
            createdAt: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!testRun) {
      return NextResponse.json({ error: 'Test run not found' }, { status: 404 });
    }

    // Calculate summary statistics
    const total = testRun.testRunCases.length;
    const resultsByStatus = testRun.testResults.reduce((acc: Record<string, number>, result) => {
      acc[result.status] = (acc[result.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const passed = resultsByStatus[TestResultStatus.PASSED] || 0;
    const failed = resultsByStatus[TestResultStatus.FAILED] || 0;
    const skipped = resultsByStatus[TestResultStatus.SKIPPED] || 0;
    const blocked = resultsByStatus[TestResultStatus.BLOCKED] || 0;
    const pending = total - (passed + failed + skipped + blocked);
    const completionRate = total > 0 ? ((passed + failed + skipped + blocked) / total) * 100 : 0;

    // Calculate execution time if available
    let executionTime = null;
    if (testRun.startTime && testRun.completedAt) {
      executionTime = testRun.completedAt.getTime() - testRun.startTime.getTime();
    }

    // Format the report
    const report = {
      id: testRun.id,
      name: testRun.name,
      status: testRun.status,
      createdBy: testRun.user,
      createdAt: testRun.createdAt,
      startTime: testRun.startTime,
      completedAt: testRun.completedAt,
      executionTime,
      summary: {
        total,
        passed,
        failed,
        skipped,
        blocked,
        pending,
        completionRate
      },
      testCases: testRun.testRunCases.map(testCase => {
        const result = testRun.testResults.find(r => r.testCaseId === testCase.testCaseId);
        return {
          id: testCase.testCaseId,
          title: testCase.testCase.title,
          priority: testCase.testCase.priority,
          status: result?.status || 'PENDING',
          notes: result?.notes,
          evidence: result?.evidence,
          executedBy: result?.executedById ? {
            id: result.executedById
          } : null,
          executedAt: result?.executedAt || null
        };
      })
    };

    logger.info(`Generated report for test run ${params.runId}`);
    return NextResponse.json(report);
  } catch (error) {
    logger.error('Error generating test run report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report', details: (error as Error).message },
      { status: 500 }
    );
  }
} 