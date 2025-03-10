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
    
    // Fetch the test run with related data
    const testRun = await prisma.testRun.findUnique({
      where: { id: testRunId },
      include: {
        testRunCases: {
          include: {
            testCase: true,
          },
        },
        testResults: true,
        project: {
          select: {
            name: true,
          },
        },
      },
    });
    
    if (!testRun) {
      return NextResponse.json(
        { error: 'Test run not found' },
        { status: 404 }
      );
    }
    
    logger.info(`Test run ${testRunId} viewed by user ${req.user.id}`, {
      userId: req.user.id,
      testRunId,
    });
    
    return NextResponse.json(testRun);
  } catch (error) {
    return handleApiError(error);
  }
}); 