import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { protect } from '@/lib/auth/protect';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/api/errorHandler';
import type { AuthenticatedRequest } from '@/lib/auth/withAuth';

// @ts-expect-error - The protect function expects NextRequest but we're using AuthenticatedRequest
export const GET = protect(async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const testRunId = params.id;
    
    // Find the test report for this test run
    const testReport = await prisma.testReport.findFirst({
      where: { runId: testRunId },
      include: {
        project: {
          select: {
            name: true,
          },
        },
        testRun: {
          select: {
            name: true,
            status: true,
            startTime: true,
            completedAt: true,
          },
        },
        createdBy: {
          select: {
            name: true,
          },
        },
      },
    });
    
    if (!testReport) {
      return NextResponse.json(
        { error: 'Test report not found' },
        { status: 404 }
      );
    }
    
    logger.info(`Test report for test run ${testRunId} viewed by user ${req.user.id}`, {
      userId: req.user.id,
      testRunId,
      reportId: testReport.id,
    });
    
    return NextResponse.json(testReport);
  } catch (error) {
    return handleApiError(error);
  }
}); 