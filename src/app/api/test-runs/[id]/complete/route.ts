import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { protect } from '@/lib/auth/protect';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/api/errorHandler';
import type { AuthenticatedRequest } from '@/lib/auth/withAuth';

// @ts-expect-error - The protect function expects NextRequest but we're using AuthenticatedRequest
export const POST = protect(async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const testRunId = params.id;
    
    // Check if the test run exists
    const testRun = await prisma.testRun.findUnique({
      where: { id: testRunId },
      include: {
        testRunCases: true,
      },
    });
    
    if (!testRun) {
      return NextResponse.json(
        { error: 'Test run not found' },
        { status: 404 }
      );
    }
    
    // Check if the test run is in progress
    if (testRun.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { error: `Test run is not in progress. Current status: ${testRun.status}` },
        { status: 400 }
      );
    }
    
    // Check if all test cases have been executed
    const pendingTestCases = testRun.testRunCases.filter(
      (testCase) => testCase.status === 'PENDING'
    );
    
    if (pendingTestCases.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot complete test run with pending test cases',
          pendingCount: pendingTestCases.length,
        },
        { status: 400 }
      );
    }
    
    // Complete the test run
    const updatedTestRun = await prisma.testRun.update({
      where: { id: testRunId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
    
    // Generate a test report
    const testResults = await prisma.testCaseResult.findMany({
      where: { testRunId },
      include: {
        testCase: {
          select: {
            title: true,
          },
        },
        executedBy: {
          select: {
            name: true,
          },
        },
      },
    });
    
    // Calculate statistics
    const total = testResults.length;
    const passed = testResults.filter((r) => r.status === 'PASSED').length;
    const failed = testResults.filter((r) => r.status === 'FAILED').length;
    const blocked = testResults.filter((r) => r.status === 'BLOCKED').length;
    const skipped = testResults.filter((r) => r.status === 'SKIPPED').length;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
    
    // Calculate duration
    let duration = 0;
    if (testResults.length > 0) {
      const sortedResults = [...testResults].sort(
        (a, b) => new Date(a.executedAt).getTime() - new Date(b.executedAt).getTime()
      );
      
      const firstResult = sortedResults[0];
      const lastResult = sortedResults[sortedResults.length - 1];
      
      if (firstResult && lastResult) {
        duration = new Date(lastResult.executedAt).getTime() - new Date(firstResult.executedAt).getTime();
      }
    }
    
    // Create the test report
    const testReport = await prisma.testReport.create({
      data: {
        name: `${testRun.name} Report`,
        projectId: testRun.projectId,
        runId: testRunId,
        createdById: req.user.id,
        statistics: {
          total,
          passed,
          failed,
          blocked,
          skipped,
          passRate,
          duration,
        },
        results: testResults.map((result) => ({
          testCaseId: result.testCaseId,
          testCaseName: result.testCase.title,
          status: result.status,
          executedBy: result.executedBy.name || 'Unknown',
          executedAt: result.executedAt,
          notes: result.notes,
        })),
      },
    });
    
    logger.info(`Test run ${testRunId} completed by user ${req.user.id}`, {
      userId: req.user.id,
      testRunId,
      reportId: testReport.id,
    });
    
    return NextResponse.json({
      ...updatedTestRun,
      reportId: testReport.id,
    });
  } catch (error) {
    return handleApiError(error);
  }
}); 