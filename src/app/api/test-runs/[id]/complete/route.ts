import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { AuthenticatedRequest } from '@/lib/auth/withAuth';
import { protect } from '@/lib/auth/protect';
import { handleApiError } from '@/lib/api/errorHandler';
import type { TestRun } from '@prisma/client';

interface RouteParams {
  params: { id: string };
}

/**
 * Complete a test run by updating its status to COMPLETED and setting the completedAt timestamp
 */
async function completeTestRun(testRunId: string): Promise<{
  success: boolean;
  data?: TestRun;
  error?: { message: string };
}> {
  try {
    // Check if the test run exists
    const testRun = await prisma.testRun.findUnique({
      where: { id: testRunId }
    });

    if (!testRun) {
      return {
        success: false,
        error: { message: 'Test run not found' }
      };
    }

    // Update the test run status to COMPLETED
    const updatedTestRun = await prisma.testRun.update({
      where: { id: testRunId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });

    return {
      success: true,
      data: updatedTestRun
    };
  } catch (error) {
    console.error('Error completing test run:', error);
    return {
      success: false,
      error: { message: 'Failed to complete test run' }
    };
  }
}

// @ts-expect-error - The protect function expects NextRequest but we're using AuthenticatedRequest
export const POST = protect(async (req: AuthenticatedRequest, { params }: RouteParams) => {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Test run ID is required' } },
        { status: 400 }
      );
    }

    // Call the completeTestRun function
    const result = await completeTestRun(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Unknown error' },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    return handleApiError(error);
  }
}); 