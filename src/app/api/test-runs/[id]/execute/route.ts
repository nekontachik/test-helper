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
    });
    
    if (!testRun) {
      return NextResponse.json(
        { error: 'Test run not found' },
        { status: 404 }
      );
    }
    
    // Check if the test run is already in progress or completed
    if (testRun.status === 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'Test run is already in progress' },
        { status: 400 }
      );
    }
    
    if (testRun.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Test run is already completed' },
        { status: 400 }
      );
    }
    
    // Update the test run status to IN_PROGRESS
    const updatedTestRun = await prisma.testRun.update({
      where: { id: testRunId },
      data: {
        status: 'IN_PROGRESS',
        startTime: new Date(),
      },
      include: {
        testRunCases: {
          include: {
            testCase: true,
          },
        },
      },
    });
    
    logger.info(`Test run ${testRunId} execution started by user ${req.user.id}`, {
      userId: req.user.id,
      testRunId,
    });
    
    return NextResponse.json(updatedTestRun);
  } catch (error) {
    return handleApiError(error);
  }
}); 